const validSides = new Set(['prosecutor', 'defense', 'judge'])

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const safeText = (value) => (
  typeof value === 'string' && value.trim().length > 0 ? value : null
)

const normalizeItems = (value) => {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((item) => ({
    title: safeText(item.title ?? item.label) ?? 'Unspecified finding',
    description: safeText(item.description ?? item.detail ?? item.text) ?? 'No further detail was provided.',
    severity: safeText(item.severity) ?? 'Minor',
    line: Number.isInteger(item.line) && item.line > 0 ? item.line : null,
  }))
}

export const normalizeTrialEntry = (entry) => {
  if (!isRecord(entry) || !validSides.has(entry.side)) return null

  const openingStatement = safeText(entry.opening_statement)
  const text = safeText(entry.text)
  const argumentItems = normalizeItems(entry.side === 'defense'
    ? entry.defenses ?? entry.charges
    : entry.charges ?? entry.defenses)

  return {
    speaker: safeText(entry.speaker) ?? (entry.side === 'judge' ? 'Judge' : entry.side),
    side: entry.side,
    opening_statement: openingStatement ?? (!text ? 'The court reporter could not make out this part of the argument.' : null),
    text,
    ...(entry.side === 'prosecutor' ? { charges: argumentItems } : {}),
    ...(entry.side === 'defense' ? { defenses: argumentItems } : {}),
    closing_statement: safeText(entry.closing_statement),
  }
}

const normalizeEvidence = (value) => (
  Array.isArray(value)
    ? value.filter(isRecord).map((item) => ({
        line: Number.isInteger(item.line) && item.line > 0 ? item.line : null,
        label: safeText(item.label) ?? 'Unspecified finding',
        description: safeText(item.description) ?? 'No further detail was provided.',
        severity: safeText(item.severity) ?? 'Minor',
        confidence: Number.isFinite(item.confidence) ? item.confidence : null,
      }))
    : []
)

const yieldToPaint = () => (
  typeof requestAnimationFrame === 'function'
    ? new Promise((resolve) => requestAnimationFrame(resolve))
    : Promise.resolve()
)

export class TrialApiError extends Error {
  constructor(message, stage = 'prosecution', cause) {
    super(message, { cause })
    this.name = 'TrialApiError'
    this.stage = ['prosecution', 'defense', 'verdict'].includes(stage) ? stage : 'prosecution'
  }
}

export const normalizeTrialData = (payload, languageHint) => {
  if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.transcript) || !isRecord(payload.verdict)) {
    throw new TrialApiError('The court reporter could not make out the trial response. Please retry.', 'verdict')
  }

  const transcript = payload.transcript.map(normalizeTrialEntry).filter(Boolean)
  const verdictText = safeText(payload.verdict.verdict)

  if (!verdictText || transcript.length === 0) {
    throw new TrialApiError('The court reporter could not make out the trial response. Please retry.', 'verdict')
  }

  const resultType = ['issue', 'clear', 'review'].includes(payload.verdict.resultType)
    ? payload.verdict.resultType
    : 'review'

  return {
    success: true,
    transcript,
    evidence: normalizeEvidence(payload.evidence),
    verdict: {
      status: safeText(payload.verdict.status) ?? 'Ruling',
      resultType,
      score: Number.isFinite(payload.verdict.score) ? payload.verdict.score : null,
      verdict: verdictText,
      summary: safeText(payload.verdict.summary),
      reasoning: safeText(payload.verdict.reasoning),
      recommendation: safeText(payload.verdict.recommendation),
      detected: safeText(payload.verdict.detected),
      impact: safeText(payload.verdict.impact),
      sentence: Array.isArray(payload.verdict.sentence)
        ? payload.verdict.sentence.map(safeText).filter(Boolean)
        : [],
    },
    languageHint: isRecord(payload.languageHint) ? payload.languageHint : languageHint,
  }
}

const readTrialStream = async (response, onProgress) => {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new TrialApiError('The court returned an unreadable response. Please retry the trial.', 'verdict')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let result = null

  const consumeLine = async (line) => {
    if (!line.trim()) return

    let event
    try {
      event = JSON.parse(line)
    } catch (error) {
      throw new TrialApiError('The court returned an unreadable response. Please retry the trial.', 'verdict', error)
    }

    if (event.type === 'progress') {
      const stage = ['prosecution', 'defense', 'verdict'].includes(event.stage) ? event.stage : null
      const status = ['active', 'complete', 'error'].includes(event.status) ? event.status : null
      if (!stage || !status) {
        throw new TrialApiError('The court reporter could not make out the trial progress. Please retry.', event.stage)
      }

      const entry = event.entry ? normalizeTrialEntry(event.entry) : null
      if (event.entry && !entry) {
        throw new TrialApiError('The court reporter could not make out this part of the argument. Please retry.', stage)
      }

      onProgress?.({
        stage,
        status,
        entry,
        evidence: event.evidence ? normalizeEvidence(event.evidence) : undefined,
      })
      await yieldToPaint()
      return
    }

    if (event.type === 'error') {
      throw new TrialApiError(
        safeText(event.error) ?? 'The court could not complete this review. Please retry.',
        event.stage,
      )
    }

    if (event.type === 'result') result = event.result
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      await consumeLine(line)
    }

    if (done) break
  }

  await consumeLine(buffer)
  if (!result) {
    throw new TrialApiError('The court reporter lost connection before the ruling. Please retry.', 'verdict')
  }
  return result
}

export const analyzeCase = async (
  code,
  languageHint = { language: 'auto', detected: false },
  { signal, onProgress } = {},
) => {
  let response

  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        Accept: 'application/x-ndjson, application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, languageHint }),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new TrialApiError('The court reporter lost connection. Please retry the trial.', 'prosecution', error)
  }

  let payload
  if (response.headers.get('content-type')?.includes('application/x-ndjson')) {
    if (!response.ok) {
      throw new TrialApiError('The court could not complete this review. Please retry.', 'prosecution')
    }
    payload = await readTrialStream(response, onProgress)
  } else {
    try {
      payload = await response.json()
    } catch (error) {
      throw new TrialApiError('The court returned an unreadable response. Please retry the trial.', 'verdict', error)
    }

    if (!response.ok || payload?.success === false) {
      throw new TrialApiError(
        safeText(payload?.error) ?? 'The court could not complete this review. Please retry.',
        payload?.stage,
      )
    }
  }

  return normalizeTrialData(payload, languageHint)
}