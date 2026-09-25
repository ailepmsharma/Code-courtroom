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

    try {
      const result = await analyzeCase(code)

      if (!result.success) {
        setError(result.error)
        return
      }

      setTranscript(result.transcript)
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
        <HeroPanel onLoadSample={loadSample} />

        <InputPanel
          code={code}
          onCodeChange={setCode}
          onSubmit={handleSubmit}
          onLoadSample={loadSample}
          isSubmitting={isSubmitting}
          isValid={isValid}
          overLimit={overLimit}
        />

        {error && <ErrorBanner message={error} />}

        <TranscriptView transcript={transcript} isSubmitting={isSubmitting} />

        <VerdictCard verdict={verdict} />
      </main>
    </div>
  )
}

export default Courtroom
