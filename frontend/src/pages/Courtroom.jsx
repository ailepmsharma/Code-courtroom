import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import HeroPanel from '../components/HeroPanel'
import InputPanel from '../components/InputPanel'
import TranscriptView from '../components/TranscriptView'
import VerdictCard from '../components/VerdictCard'
import ErrorBanner from '../components/ErrorBanner'
import { analyzeCase } from '../services/api'
import { buggyCodeSample, cleanCodeSample } from '../data/sampleCode.js'
import { getLanguageHint } from '../data/languages.js'

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration))

const Courtroom = () => {
  const [code, setCode] = useState('')
  const [transcript, setTranscript] = useState([])
  const [trialSession, setTrialSession] = useState(0)
  const [verdict, setVerdict] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('auto')
  const textareaRef = useRef(null)

  const isValid = code.trim().length > 0
  const overLimit = code.length > 4000

  useEffect(() => {
    if (!verdict) {
      return
    }

    requestAnimationFrame(() => {
      document.getElementById('transcript-section')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }, [verdict])

  const loadSample = (variant) => {
    const nextCode = variant === 'buggy' ? buggyCodeSample : cleanCodeSample
    setCode(nextCode)
    setTranscript([])
    setVerdict(null)
    setEvidence([])
    setError('')
    setLoadingStage('')

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCode.length, nextCode.length)
    })
  }

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return
    }

    setError('')
    setIsSubmitting(true)
    setTrialSession((current) => current + 1)
    setLoadingStage('prosecutor')
    setTranscript([])
    setVerdict(null)
    setEvidence([])

    requestAnimationFrame(() => {
      document.getElementById('transcript-section')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })

    try {
      const result = await analyzeCase(code, getLanguageHint(code, language))

      if (!result.success) {
        setError(result.error)
        return
      }

      const trialTranscript = Array.isArray(result.transcript) ? result.transcript : []
      const prosecutorEntry = trialTranscript.find((entry) => entry.side === 'prosecutor')
      const defenseEntry = trialTranscript.find((entry) => entry.side === 'defense')
      const judgeEntry = trialTranscript.find((entry) => entry.side === 'judge')
      const revealDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 90 : 620

      setEvidence(Array.isArray(result.evidence) ? result.evidence : [])
      setTranscript(prosecutorEntry ? [prosecutorEntry] : [])

      if (defenseEntry) {
        setLoadingStage('defense')
        await wait(revealDelay)
        setTranscript((current) => [...current, defenseEntry])
      }

      if (judgeEntry) {
        setLoadingStage('judge')
        await wait(revealDelay)
        setTranscript((current) => [...current, judgeEntry])
      }

      setLoadingStage('')
      setVerdict(result.verdict)
    } catch {
      setError('Unable to analyze this case right now. Try again.')
    } finally {
      setLoadingStage('')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="page-shell">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isSubmitting ? 'Analyzing your case…' : ''}
        </p>

        <section id="input-section" data-section="01" className="input-section" aria-labelledby="page-title">
          <HeroPanel onLoadSample={loadSample} />
          <InputPanel
            code={code}
            onCodeChange={setCode}
            onSubmit={handleSubmit}
            onLoadSample={loadSample}
            isSubmitting={isSubmitting}
            isValid={isValid}
            overLimit={overLimit}
            textareaRef={textareaRef}
            language={language}
            onLanguageChange={setLanguage}
          />
          <ErrorBanner message={error} />
        </section>

        <TranscriptView key={trialSession} transcript={transcript} evidence={evidence} isSubmitting={isSubmitting} loadingStage={loadingStage} />

        <VerdictCard verdict={verdict} />
      </main>

      <footer className="site-footer">
        <span>CODE COURTROOM</span>
        <span>Local rule-based demo · No AI model or backend connected</span>
      </footer>
    </div>
  )
}

export default Courtroom
