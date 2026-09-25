import { useRef, useState } from 'react'
import Header from '../components/Header'
import HeroPanel from '../components/HeroPanel'
import InputPanel from '../components/InputPanel'
import TranscriptView from '../components/TranscriptView'
import VerdictCard from '../components/VerdictCard'
import ErrorBanner from '../components/ErrorBanner'
import { analyzeCase } from '../services/api'
import { buggyCodeSample, cleanCodeSample } from '../data/sampleCode.js'

const Courtroom = () => {
  const [code, setCode] = useState(buggyCodeSample)
  const [transcript, setTranscript] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  const isValid = code.trim().length > 0
  const overLimit = code.length > 4000

  const loadSample = (variant) => {
    const nextCode = variant === 'buggy' ? buggyCodeSample : cleanCodeSample
    setCode(nextCode)
    setTranscript([])
    setVerdict(null)
    setEvidence([])
    setError('')

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
    setTranscript([])
    setVerdict(null)
    setEvidence([])

    try {
      const result = await analyzeCase(code)

      if (!result.success) {
        setError(result.error)
        return
      }

      setTranscript(result.transcript)
      setEvidence(result.evidence)
      setVerdict(result.verdict)

      requestAnimationFrame(() => {
        document.getElementById('transcript-section')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    } catch {
      setError('Unable to analyze this case right now. Try again.')
    } finally {
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

        <section id="input-section" className="input-section" aria-labelledby="page-title">
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
          />
          <ErrorBanner message={error} />
        </section>

        <TranscriptView transcript={transcript} evidence={evidence} isSubmitting={isSubmitting} />

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
