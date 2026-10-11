import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import AmbientEffects from '../components/AmbientEffects'
import HeroPanel from '../components/HeroPanel'
import CourtroomStory from '../components/CourtroomStory.jsx'
import InputPanel from '../components/InputPanel'
import TranscriptView from '../components/TranscriptView'
import VerdictCard from '../components/VerdictCard'
import IntroOverlay from '../components/IntroOverlay'
import CaseFilesDrawer from '../components/CaseFilesDrawer'
import { analyzeCase, TrialApiError } from '../services/api'
import { buggyCodeSample, cleanCodeSample } from '../data/sampleCode.js'
import { getLanguageHint } from '../data/languages.js'
import { useTheme } from '../hooks/useTheme.js'

const idleProgress = { prosecution: 'pending', defense: 'pending', verdict: 'pending' }
const completeProgress = { prosecution: 'complete', defense: 'complete', verdict: 'complete' }
const loadingRoleByStage = { prosecution: 'prosecutor', defense: 'defense', verdict: 'judge' }

const progressWithFailure = (stage) => {
  const stages = ['prosecution', 'defense', 'verdict']
  const failedIndex = stages.indexOf(stage)

  return Object.fromEntries(stages.map((currentStage, index) => [
    currentStage,
    index < failedIndex ? 'complete' : index === failedIndex ? 'error' : 'pending',
  ]))
}

const readCaseFiles = () => {
  try {
    const files = JSON.parse(localStorage.getItem('code-courtroom-case-files') ?? '[]')
    const validFiles = Array.isArray(files)
      ? files.filter((file) => (
          file && typeof file === 'object'
          && typeof file.id === 'string'
          && typeof file.title === 'string'
          && typeof file.status === 'string'
          && typeof file.date === 'string'
        )).slice(0, 12)
      : null
    return validFiles ? { files: validFiles, error: '' } : { files: [], error: 'The local case archive could not be read.' }
  } catch {
    return { files: [], error: 'The local case archive is unavailable in this browser.' }
  }
}

const Courtroom = () => {
  const [code, setCode] = useState('')
  const [transcript, setTranscript] = useState([])
  const [trialSession, setTrialSession] = useState(0)
  const [verdict, setVerdict] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [progress, setProgress] = useState(idleProgress)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('auto')
  const [gavelStrike, setGavelStrike] = useState(false)
  const [contemptChaos, setContemptChaos] = useState(false)
  const [caseHistory, setCaseHistory] = useState(readCaseFiles)
  const [caseFilesOpen, setCaseFilesOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState(null)
  const [heroVisible, setHeroVisible] = useState(true)
  const [editorVisible, setEditorVisible] = useState(true)
  const [marqueeReverse, setMarqueeReverse] = useState(false)
  const [pageTransition, setPageTransition] = useState(false)
  const [sampleTyping, setSampleTyping] = useState(false)
  const [verdictReveal, setVerdictReveal] = useState(false)
  const [autopilotActive, setAutopilotActive] = useState(false)
  const [autopilotVisible, setAutopilotVisible] = useState(false)
  const [autopilotStage, setAutopilotStage] = useState('typing')
  const [presentationMode, setPresentationMode] = useState(false)
  const [presentationHint, setPresentationHint] = useState(false)
  const textareaRef = useRef(null)
  const requestIdRef = useRef(0)
  const requestRef = useRef(null)
  const gavelTimerRef = useRef(null)
  const chaosTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const sampleTypingRef = useRef(null)
  const verdictTimerRef = useRef(null)
  const verdictOverlayRef = useRef(null)
  const autopilotTimerRef = useRef(null)
  const presentationTimerRef = useRef(null)
  const autopilotActiveRef = useRef(false)
  const submitRef = useRef(null)
  const startAutopilotRef = useRef(null)
  const stopAutopilotRef = useRef(null)
  const togglePresentationRef = useRef(null)
  const { reduceEffects, toggleReduceEffects } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-effects', reduceEffects)
  }, [reduceEffects])

  useEffect(() => {
    document.documentElement.classList.toggle('presentation-mode', presentationMode)
    return () => document.documentElement.classList.remove('presentation-mode')
  }, [presentationMode])

  useEffect(() => {
    const hero = document.querySelector('.hero-panel')
    const editor = document.querySelector('.input-panel')
    if (!hero || !editor) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting)
        if (entry.target === editor) setEditorVisible(entry.isIntersecting)
      })
    }, { threshold: 0.15 })
    observer.observe(hero)
    observer.observe(editor)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)')
    let activeCard = null
    const updateCard = (event) => {
      if (!pointerFine.matches || reduceEffects) return
      const card = event.target instanceof Element
        ? event.target.closest('.panel:not(.hero-panel), .speech-bubble, .verdict-card, .evidence-item, .case-file')
        : null
      if (activeCard && activeCard !== card) {
        activeCard.style.removeProperty('--pointer-x')
        activeCard.style.removeProperty('--pointer-y')
        activeCard.style.removeProperty('--tilt-x')
        activeCard.style.removeProperty('--tilt-y')
      }
      activeCard = card
      if (!card) return
      const bounds = card.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height
      card.style.setProperty('--pointer-x', `${x * 100}%`)
      card.style.setProperty('--pointer-y', `${y * 100}%`)
      card.style.setProperty('--tilt-x', `${(x - 0.5) * 6}deg`)
      card.style.setProperty('--tilt-y', `${(0.5 - y) * 6}deg`)
    }
    document.addEventListener('pointermove', updateCard, { passive: true })
    return () => document.removeEventListener('pointermove', updateCard)
  }, [reduceEffects])

  useEffect(() => {
    let previousScrollY = window.scrollY
    const updateScrollEffects = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight
      const progressValue = scrollRange > 0 ? window.scrollY / scrollRange : 0
      document.documentElement.style.setProperty('--scroll-progress', String(progressValue))
      setMarqueeReverse(window.scrollY < previousScrollY)
      previousScrollY = window.scrollY
    }
    window.addEventListener('scroll', updateScrollEffects, { passive: true })
    updateScrollEffects()
    return () => {
      window.removeEventListener('scroll', updateScrollEffects)
      document.documentElement.style.removeProperty('--scroll-progress')
    }
  }, [])

  useEffect(() => {
    const updateVisibility = () => document.documentElement.classList.toggle('tab-hidden', document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    updateVisibility()
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let entered = []
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && autopilotActiveRef.current) {
        stopAutopilotRef.current?.()
        return
      }
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return
      if (event.shiftKey && event.key.toLowerCase() === 'd' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        startAutopilotRef.current?.()
        return
      }
      if (!event.shiftKey && event.key.toLowerCase() === 'p' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        togglePresentationRef.current?.()
        return
      }
      if (!event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        setGavelStrike(true)
        window.clearTimeout(gavelTimerRef.current)
        gavelTimerRef.current = window.setTimeout(() => setGavelStrike(false), 500)
        return
      }
      entered = [...entered, event.key].slice(-sequence.length)
      if (sequence.every((key, index) => entered[index] === key)) {
        setContemptChaos(true)
        entered = []
        window.clearTimeout(chaosTimerRef.current)
        chaosTimerRef.current = window.setTimeout(() => setContemptChaos(false), 4000)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(gavelTimerRef.current)
      window.clearTimeout(chaosTimerRef.current)
      window.clearTimeout(transitionTimerRef.current)
      window.clearInterval(sampleTypingRef.current)
      window.clearTimeout(verdictTimerRef.current)
      window.clearTimeout(autopilotTimerRef.current)
      window.clearTimeout(presentationTimerRef.current)
    }
  }, [])

  const isValid = code.trim().length > 0
  const overLimit = code.length > 4000
  const playPageTransition = () => {
    if (reduceEffects) return
    setPageTransition(true)
    window.clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = window.setTimeout(() => setPageTransition(false), 650)
  }

  const cancelPendingRequest = () => {
    requestIdRef.current += 1
    requestRef.current?.abort()
    requestRef.current = null
  }

  useEffect(() => {
    if (!verdict) {
      return
    }

    requestAnimationFrame(() => {
      document.querySelector('.verdict-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [verdict])

  useEffect(() => {
    if (!verdictReveal || !verdictOverlayRef.current) return undefined
    let frame = 0
    frame = requestAnimationFrame(() => {
      const card = document.querySelector('.verdict-card')
      if (!card || !verdictOverlayRef.current) return
      const bounds = card.getBoundingClientRect()
      verdictOverlayRef.current.style.setProperty('--focus-x', `${bounds.left + bounds.width / 2}px`)
      verdictOverlayRef.current.style.setProperty('--focus-y', `${bounds.top + Math.min(bounds.height / 2, 300)}px`)
    })
    return () => cancelAnimationFrame(frame)
  }, [verdict, verdictReveal])

  const saveCaseFile = (caseVerdict, submittedCode) => {
    const title = submittedCode.split(/\r\n|\r|\n/).find((line) => line.trim())?.trim().slice(0, 54) || 'Untitled code evidence'
    const file = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      resultType: caseVerdict.resultType,
      status: caseVerdict.resultType === 'review' ? 'LIMITED DEMO' : caseVerdict.verdict,
      score: caseVerdict.resultType !== 'review' && Number.isFinite(caseVerdict.score) ? caseVerdict.score : null,
      date: new Date().toISOString(),
    }
    const files = [file, ...caseHistory.files].slice(0, 12)
    setCaseHistory({ files, error: '' })
    try {
      localStorage.setItem('code-courtroom-case-files', JSON.stringify(files))
    } catch {
      setCaseHistory({ files: caseHistory.files, error: 'This browser could not save the case file. Your ruling is still available.' })
    }
  }

  const loadSample = (variant) => {
    playPageTransition()
    cancelPendingRequest()
    const nextCode = variant === 'buggy' ? buggyCodeSample : cleanCodeSample
    window.clearInterval(sampleTypingRef.current)
    setCode('')
    setSampleTyping(true)
    let typedLength = 0
    sampleTypingRef.current = window.setInterval(() => {
      typedLength = Math.min(nextCode.length, typedLength + 15)
      setCode(nextCode.slice(0, typedLength))
      if (typedLength >= nextCode.length) {
        window.clearInterval(sampleTypingRef.current)
        setSampleTyping(false)
      }
    }, 16)
    setTranscript([])
    setVerdict(null)
    setEvidence([])
    setError('')
    setLoadingStage('')
    setIsSubmitting(false)
    setProgress(idleProgress)
    setTrialSession((current) => current + 1)

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCode.length, nextCode.length)
    })
  }

  const stopAutopilot = ({ abortRequest = true } = {}) => {
    autopilotActiveRef.current = false
    setAutopilotActive(false)
    setAutopilotVisible(false)
    window.clearTimeout(autopilotTimerRef.current)
    window.clearInterval(sampleTypingRef.current)
    setSampleTyping(false)
    if (abortRequest && requestRef.current) {
      cancelPendingRequest()
      setIsSubmitting(false)
      setLoadingStage('')
      setProgress(idleProgress)
    }
  }

  const handleSubmit = async ({ retry = false } = {}) => {
    if (!isValid || isSubmitting || sampleTyping) {
      return
    }

    playPageTransition()
    setError(retry ? 'Retrying the court review…' : '')
    setIsSubmitting(true)
    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    requestRef.current = controller
    setTrialSession((current) => current + 1)
    setLoadingStage('prosecutor')
    setProgress({ prosecution: 'active', defense: 'pending', verdict: 'pending' })
    setTranscript([])
    setVerdict(null)
    setEvidence([])

    requestAnimationFrame(() => {
      document.getElementById('transcript-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    try {
      const result = await analyzeCase(code, getLanguageHint(code, language), {
        signal: controller.signal,
        onProgress: (event) => {
          if (requestId !== requestIdRef.current) return

          const stages = ['prosecution', 'defense', 'verdict']
          const activeIndex = stages.indexOf(event.stage)
          setLoadingStage(event.status === 'active' ? loadingRoleByStage[event.stage] : '')
          if (autopilotActiveRef.current && event.status === 'active') setAutopilotStage(event.stage)

          if (event.status === 'active') {
            setProgress((current) => Object.fromEntries(stages.map((stage, index) => [
              stage,
              index < activeIndex ? 'complete' : index === activeIndex ? 'active' : current[stage] ?? 'pending',
            ])))
          } else if (event.status === 'complete') {
            setProgress((current) => ({ ...current, [event.stage]: 'complete' }))
          }

          if (event.entry) {
            setTranscript((current) => [...current.filter((entry) => entry.side !== event.entry.side), event.entry])
          }
          if (event.evidence) setEvidence(event.evidence)
        },
      })
      if (requestId !== requestIdRef.current) return

      setEvidence(result.evidence)
      setTranscript(result.transcript)
      setProgress(completeProgress)
      setError('')
      setLoadingStage('')
      saveCaseFile(result.verdict, code)
      setVerdict(result.verdict)
      if (!reduceEffects) {
        setVerdictReveal(true)
        window.clearTimeout(verdictTimerRef.current)
        verdictTimerRef.current = window.setTimeout(() => setVerdictReveal(false), 1800)
      }
      if (autopilotActiveRef.current) {
        autopilotActiveRef.current = false
        setAutopilotActive(false)
        setAutopilotStage('complete')
        window.clearTimeout(autopilotTimerRef.current)
        autopilotTimerRef.current = window.setTimeout(() => setAutopilotVisible(false), 3000)
      }
    } catch (requestError) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return

      console.error('Trial request failed:', requestError)
      const failedStage = requestError instanceof TrialApiError ? requestError.stage : 'prosecution'
      setProgress(progressWithFailure(failedStage))
      setError(requestError instanceof TrialApiError
        ? requestError.message
        : 'The court reporter lost connection. Please retry the trial.')
      if (autopilotActiveRef.current) stopAutopilot({ abortRequest: false })
    } finally {
      if (requestId === requestIdRef.current) {
        requestRef.current = null
        setLoadingStage('')
        setIsSubmitting(false)
      }
    }
  }

  const handleAppeal = () => {
    playPageTransition()
    window.clearTimeout(verdictTimerRef.current)
    setVerdictReveal(false)
    window.clearInterval(sampleTypingRef.current)
    setSampleTyping(false)
    cancelPendingRequest()
    setTranscript([])
    setVerdict(null)
    setEvidence([])
    setError('')
    setLoadingStage('')
    setProgress(idleProgress)
    setIsSubmitting(false)
    setTrialSession((current) => current + 1)

    requestAnimationFrame(() => {
      document.getElementById('input-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      textareaRef.current?.focus({ preventScroll: true })
    })
  }

  const handleSelectLine = (line) => {
    const editor = textareaRef.current
    if (!editor || !Number.isInteger(line) || line < 1) return

    const lines = code.split(/\r\n|\r|\n/)
    if (line > lines.length) return
    setSelectedLine(line)
    const lineBreaks = code.match(/\r\n|\r|\n/g) ?? []
    const start = lines.slice(0, line - 1).reduce((total, text, index) => (
      total + text.length + (lineBreaks[index]?.length ?? 0)
    ), 0)
    document.getElementById('input-section')?.scrollIntoView({
      behavior: reduceEffects ? 'auto' : 'smooth',
      block: 'start',
    })
    requestAnimationFrame(() => {
      editor.focus({ preventScroll: true })
      editor.setSelectionRange(start, start + lines[line - 1].length)
    })
  }

  const startAutopilot = () => {
    if (autopilotActiveRef.current) return
    window.clearTimeout(autopilotTimerRef.current)
    autopilotActiveRef.current = true
    setAutopilotActive(true)
    setAutopilotVisible(true)
    setAutopilotStage('typing')
    loadSample('buggy')
  }

  const togglePresentation = () => {
    setPresentationMode((current) => !current)
    setPresentationHint(true)
    window.clearTimeout(presentationTimerRef.current)
    presentationTimerRef.current = window.setTimeout(() => setPresentationHint(false), 3000)
  }

  useEffect(() => {
    submitRef.current = handleSubmit
    startAutopilotRef.current = startAutopilot
    stopAutopilotRef.current = stopAutopilot
    togglePresentationRef.current = togglePresentation
  })

  useEffect(() => {
    if (!autopilotActive || autopilotStage !== 'typing' || sampleTyping || code !== buggyCodeSample) return undefined
    const timer = window.setTimeout(() => {
      setAutopilotStage('prosecution')
      submitRef.current?.()
    }, reduceEffects ? 80 : 260)
    return () => window.clearTimeout(timer)
  }, [autopilotActive, autopilotStage, sampleTyping, code, reduceEffects])

  return (
    <>
    <AmbientEffects />
    <div className="scroll-progress" aria-hidden="true" />
    {presentationHint && presentationMode && <div className="presentation-hint" role="status">Press P to exit presentation mode</div>}
    {autopilotVisible && (
      <aside className="autopilot-pill" role="status" aria-live="polite">
        <span className="autopilot-label">Autopilot</span>
        <span className="autopilot-status">{autopilotStage === 'complete' ? 'Verdict reached' : autopilotStage === 'typing' ? 'Loading buggy sample' : autopilotStage === 'prosecution' ? 'Trial in progress' : autopilotStage === 'defense' ? 'Defense speaking' : 'Judge deliberating'}</span>
        <span className="autopilot-track"><i style={{ width: autopilotStage === 'typing' ? '18%' : autopilotStage === 'prosecution' ? '38%' : autopilotStage === 'defense' ? '64%' : autopilotStage === 'verdict' ? '84%' : '100%' }} /></span>
        <button type="button" onClick={() => stopAutopilot()} aria-label="Stop autopilot">Stop</button>
      </aside>
    )}
    {verdictReveal && <div ref={verdictOverlayRef} className="verdict-stage-overlay" aria-hidden="true" />}
    <div className={`app-shell ${gavelStrike ? 'gavel-strike' : ''} ${contemptChaos && !reduceEffects ? 'contempt-chaos' : ''} ${verdictReveal ? 'verdict-reveal' : ''}`}>
      {pageTransition && <div className="page-transition-wipe" aria-hidden="true" />}
      <Header
        reduceEffects={reduceEffects}
        onToggleEffects={toggleReduceEffects}
        onOpenCaseFiles={() => setCaseFilesOpen(true)}
        caseFilesCount={caseHistory.files.length}
        onRunDemo={startAutopilot}
        onTogglePresentation={togglePresentation}
        presentationMode={presentationMode}
        demoRunning={autopilotActive}
      />
      <IntroOverlay reduceEffects={reduceEffects} />
      {caseFilesOpen && (
        <CaseFilesDrawer
          files={caseHistory.files}
          error={caseHistory.error}
          onClose={() => setCaseFilesOpen(false)}
        />
      )}

      <main className="page-shell">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isSubmitting ? 'Analyzing your case…' : ''}
        </p>

        <section id="input-section" data-section="01" className="input-section" aria-labelledby="page-title">
          <HeroPanel onLoadSample={loadSample} />
          <CourtroomStory
            reduceEffects={reduceEffects}
            stats={{
              trials: caseHistory.files.length,
              bugs: evidence.length,
              average: (() => {
                const scored = caseHistory.files.filter((file) => Number.isFinite(file.score))
                return scored.length
                  ? Math.round(scored.reduce((total, file) => total + file.score, 0) / scored.length)
                  : 0
              })(),
            }}
          />
          <InputPanel
            code={code}
            onCodeChange={(nextCode) => {
              setCode(nextCode)
              if (selectedLine && nextCode.split(/\r\n|\r|\n/).length < selectedLine) setSelectedLine(null)
            }}
            onSubmit={handleSubmit}
            onLoadSample={loadSample}
            isSubmitting={isSubmitting}
            isTypingSample={sampleTyping}
            isValid={isValid}
            overLimit={overLimit}
            textareaRef={textareaRef}
            language={language}
            onLanguageChange={setLanguage}
            selectedLine={selectedLine}
          />
        </section>

        <TranscriptView
          key={trialSession}
          transcript={transcript}
          evidence={evidence}
          isSubmitting={isSubmitting}
          loadingStage={loadingStage}
          progress={progress}
          error={error}
          onRetry={() => handleSubmit({ retry: true })}
          onDismissError={() => setError('')}
          onSelectLine={handleSelectLine}
        />

        <div className={`editorial-marquee ${marqueeReverse ? 'is-reversed' : ''}`} aria-hidden="true">
          <div className="editorial-marquee-track">EVIDENCE <i>·</i> ARGUMENT <i>·</i> RULING <i>·</i> EVIDENCE <i>·</i> ARGUMENT <i>·</i> RULING <i>·</i></div>
        </div>
        <div className={`editorial-marquee editorial-marquee-secondary ${marqueeReverse ? '' : 'is-reversed'}`} aria-hidden="true">
          <div className="editorial-marquee-track">PROSECUTION <i>·</i> DEFENSE <i>·</i> JUDGMENT <i>·</i> PROSECUTION <i>·</i> DEFENSE <i>·</i> JUDGMENT <i>·</i></div>
        </div>

        <VerdictCard verdict={verdict} onTryAgain={handleAppeal} />
      </main>

      <footer className="site-footer">
        <span>CODE COURTROOM</span>
        <span>Local rule-based review · No AI model connected</span>
      </footer>
      {!heroVisible && !editorVisible && (
        <button
          type="button"
          className="sticky-trial-action"
          onClick={() => {
            document.getElementById('code-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            textareaRef.current?.focus({ preventScroll: true })
          }}
        >
          Begin trial
        </button>
      )}
    </div>
    </>
  )
}

export default Courtroom
