import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeCase, normalizeTrialData, TrialApiError } from './api.js'

const response = {
  success: true,
  transcript: [
    {
      speaker: 'Defense',
      side: 'defense',
      opening_statement: 'The reset is defensive.',
      charges: [],
      defenses: [{ title: 'Copied state', description: 'The array is copied before reset.', severity: 'Minor', line: 4 }],
    },
  ],
  verdict: {
    status: 'No critical issues',
    resultType: 'clear',
    verdict: 'Approved with minor cleanup',
    reasoning: null,
    sentence: null,
  },
}

test('normalizer preserves role-specific lists and safely defaults optional fields', () => {
  const result = normalizeTrialData(response)

  assert.equal(result.transcript[0].defenses[0].title, 'Copied state')
  assert.equal('charges' in result.transcript[0], false)
  assert.deepEqual(result.verdict.sentence, [])
  assert.equal(result.verdict.reasoning, null)
  assert.deepEqual(result.evidence, [])
})

test('normalizer rejects unusable verdict responses with a retryable stage', () => {
  assert.throws(
    () => normalizeTrialData({ success: true, transcript: [], verdict: { verdict: '' } }),
    (error) => error instanceof TrialApiError && error.stage === 'verdict',
  )
})

test('stream adapter forwards actual role-stage events before the final result', async () => {
  const originalFetch = globalThis.fetch
  const prosecutor = { speaker: 'Prosecutor', side: 'prosecutor', opening_statement: 'The case begins.' }
  const defense = { speaker: 'Defense', side: 'defense', opening_statement: 'The defense responds.' }
  const judge = { speaker: 'Judge', side: 'judge', text: 'Ruling entered.' }
  const result = {
    success: true,
    transcript: [prosecutor, defense, judge],
    verdict: { verdict: 'No automated conclusion', resultType: 'review', sentence: [] },
  }
  const events = [
    { type: 'progress', stage: 'prosecution', status: 'active' },
    { type: 'progress', stage: 'prosecution', status: 'complete', entry: prosecutor },
    { type: 'progress', stage: 'defense', status: 'active' },
    { type: 'progress', stage: 'defense', status: 'complete', entry: defense },
    { type: 'progress', stage: 'verdict', status: 'active' },
    { type: 'progress', stage: 'verdict', status: 'complete', entry: judge },
    { type: 'result', result },
  ]
  globalThis.fetch = async () => new Response(events.map((event) => JSON.stringify(event)).join('\n'), {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })

  try {
    const observed = []
    const trial = await analyzeCase('const x = 1', undefined, {
      onProgress: ({ stage, status }) => observed.push(`${stage}:${status}`),
    })

    assert.deepEqual(observed, [
      'prosecution:active',
      'prosecution:complete',
      'defense:active',
      'defense:complete',
      'verdict:active',
      'verdict:complete',
    ])
    assert.deepEqual(trial.transcript.map((entry) => entry.side), ['prosecutor', 'defense', 'judge'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('stream adapter preserves the stage when a backend event fails', async () => {
  const originalFetch = globalThis.fetch
  const events = [
    { type: 'progress', stage: 'prosecution', status: 'active' },
    { type: 'progress', stage: 'prosecution', status: 'complete', entry: { speaker: 'Prosecutor', side: 'prosecutor' } },
    { type: 'progress', stage: 'defense', status: 'active' },
    { type: 'error', stage: 'defense', error: 'The defense response failed. Retry the trial.' },
  ]
  globalThis.fetch = async () => new Response(events.map((event) => JSON.stringify(event)).join('\n'), {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })

  try {
    await assert.rejects(
      analyzeCase('const x = 1'),
      (error) => error instanceof TrialApiError && error.stage === 'defense',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})
