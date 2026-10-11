import { useEffect, useRef, useState } from 'react'
import { detectLanguage, languageOptions } from '../data/languages.js'
import { editorPlaceholder } from '../data/reviewCopy.js'

const InputPanel = ({ code, onCodeChange, onSubmit, onLoadSample, isSubmitting, isTypingSample = false, isValid, overLimit, textareaRef, language, onLanguageChange, selectedLine }) => {
  const [copyFeedback, setCopyFeedback] = useState('')
  const [showEmptyHint, setShowEmptyHint] = useState(true)
  const [attemptFeedback, setAttemptFeedback] = useState('')
  const [sampleFeedback, setSampleFeedback] = useState('')
  const [sampleHighlight, setSampleHighlight] = useState('')
  const [submitFeedback, setSubmitFeedback] = useState('')
  const [contemptBadge, setContemptBadge] = useState(false)
  const [fullscreenEditor, setFullscreenEditor] = useState(false)
  const [scanLine, setScanLine] = useState(0)
  const attemptTimeoutRef = useRef(null)
  const sampleFeedbackTimeoutRef = useRef(null)
  const submitFeedbackTimeoutRef = useRef(null)
  const gutterRef = useRef(null)
  const highlightRef = useRef(null)
  const lineCount = code.trim() ? code.split(/\r\n|\r|\n/).length : 0
  const visibleLineCount = Math.max(1, lineCount)
  const detectedLanguage = detectLanguage(code)
  const selectedLanguage = languageOptions.find((option) => option.value === language) ?? languageOptions[0]
  const languageStatus = language === 'auto'
    ? `Auto-detect · ${code.trim() ? detectedLanguage?.label ?? 'Unspecified' : 'Unspecified'}`
    : selectedLanguage.label

  useEffect(() => () => {
    window.clearTimeout(attemptTimeoutRef.current)
    window.clearTimeout(sampleFeedbackTimeoutRef.current)
    window.clearTimeout(submitFeedbackTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!isSubmitting) return undefined
    const timer = window.setInterval(() => {
      setScanLine((line) => Math.min(lineCount, line + 1))
    }, 110)
    return () => window.clearInterval(timer)
  }, [isSubmitting, lineCount])

  useEffect(() => {
    if (!fullscreenEditor) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFullscreenEditor(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [fullscreenEditor])

  const handleEmptyAttempt = () => {
    if (isValid || isSubmitting) {
      return
    }

    setShowEmptyHint(true)
    setContemptBadge(true)
    setAttemptFeedback((current) => (current === 'attempt-a' ? 'attempt-b' : 'attempt-a'))
    window.clearTimeout(attemptTimeoutRef.current)
    attemptTimeoutRef.current = window.setTimeout(() => setAttemptFeedback(''), 280)
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()

    if (isTypingSample) return
    if (!isValid || isSubmitting) {
      handleEmptyAttempt()
      return
    }

    setScanLine(0)
    onSubmit()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyFeedback('Copied')
    } catch {
      setCopyFeedback('Unavailable')
    }
  }

  const handleSampleLoad = (variant) => {
    onLoadSample(variant)
    setCopyFeedback('')
    setShowEmptyHint(false)
    setSampleHighlight(variant)
    setSampleFeedback(`${variant === 'buggy' ? 'Buggy sample' : 'Clean sample'} loaded`)
    window.clearTimeout(sampleFeedbackTimeoutRef.current)
    sampleFeedbackTimeoutRef.current = window.setTimeout(() => {
      setSampleFeedback('')
      setSampleHighlight('')
    }, 1800)
  }

  const handleSubmitClick = (event) => {
    if (!isValid) {
      event.preventDefault()
      handleEmptyAttempt()
      return
    }

    setSubmitFeedback((current) => (current === 'commit-a' ? 'commit-b' : 'commit-a'))
    window.clearTimeout(submitFeedbackTimeoutRef.current)
    submitFeedbackTimeoutRef.current = window.setTimeout(() => setSubmitFeedback(''), 240)
  }

  const handleEditorScroll = (event) => {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop
    if (highlightRef.current) {
      highlightRef.current.scrollLeft = event.currentTarget.scrollLeft
      highlightRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  const highlightedCode = code.split(/(\b(?:const|let|var|function|return|if|else|new|class|async|await|throw|try|catch|true|false|null|undefined)\b|\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b)/g)
    .map((part, index) => {
      let tokenClass = ''
      if (/^\/\//.test(part) || /^\/\*/.test(part)) tokenClass = 'syntax-comment'
      else if (/^['"`]/.test(part)) tokenClass = 'syntax-string'
      else if (/^(const|let|var|function|return|if|else|new|class|async|await|throw|try|catch|true|false|null|undefined)$/.test(part)) tokenClass = 'syntax-keyword'
      else if (/^\d/.test(part)) tokenClass = 'syntax-number'
      return tokenClass ? <span className={tokenClass} key={index}>{part}</span> : part
    })

  return (
    <form
      className={`panel input-panel ${isSubmitting ? 'is-scanning' : ''}`}
      onSubmit={handleFormSubmit}
    >
      <div className="section-header-row">
        <div>
          <h2>Code input</h2>
        </div>
        <div className="language-control">
          <label className="language-control-label" htmlFor="language-select">Review language</label>
          <select
            id="language-select"
            className="language-select"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            disabled={isSubmitting || isTypingSample}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="quick-samples" aria-label="Sample code quick-fill options">
        <button type="button" className="sample-button" onClick={() => handleSampleLoad('buggy')} disabled={isSubmitting || isTypingSample}>
          <span>Buggy sample</span>
        </button>
        <button type="button" className="sample-button" onClick={() => handleSampleLoad('clean')} disabled={isSubmitting || isTypingSample}>
          <span>Clean sample</span>
        </button>
      </div>

      <div className={`code-workbench ${sampleHighlight ? 'sample-loaded' : ''} ${fullscreenEditor ? 'is-fullscreen' : ''}`}>
        <div className="code-toolbar">
          <div className="editor-heading">
            <span className="editor-led" aria-hidden="true" />
            <label htmlFor="code-input" className="editor-label">Your code</label>
            <span className="language-status" aria-live="polite">{languageStatus}</span>
          </div>
          <button type="button" className="copy-button" onClick={handleCopy} disabled={!isValid || isSubmitting || isTypingSample} aria-live="polite">
            {copyFeedback || 'Copy code'}
          </button>
          <button
            type="button"
            className="fullscreen-button"
            onClick={() => setFullscreenEditor((current) => !current)}
            aria-pressed={fullscreenEditor}
          >
            {fullscreenEditor ? 'Close editor' : 'Fullscreen'}
          </button>
        </div>
        <div className="code-editor-row">
          <pre ref={gutterRef} className="line-gutter" aria-hidden="true">{Array.from({ length: visibleLineCount }, (_, index) => index + 1).join('\n')}</pre>
          <div className="code-input-stack">
            <pre ref={highlightRef} className={`code-highlight ${code ? '' : 'is-empty'}`} aria-hidden="true">
              {selectedLine && selectedLine <= visibleLineCount && (
                <span
                  className="selected-code-line"
                  style={{ top: `${18 + (selectedLine - 1) * 26.4}px` }}
                />
              )}
              {code ? highlightedCode : <span className="syntax-placeholder">// {editorPlaceholder}</span>}
            </pre>
            <textarea
              ref={textareaRef}
              id="code-input"
              className="code-input"
              value={code}
              onScroll={handleEditorScroll}
              onChange={(event) => {
                onCodeChange(event.target.value)
                setCopyFeedback('')
                setShowEmptyHint(!event.target.value.trim())
                if (event.target.value.trim()) setContemptBadge(false)
              }}
              onFocus={() => {
                if (!isValid) {
                  setShowEmptyHint(true)
                }
              }}
              placeholder={editorPlaceholder}
              aria-describedby="code-help code-count code-empty-hint"
              aria-invalid={showEmptyHint && !isValid}
              spellCheck="false"
              disabled={isSubmitting || isTypingSample}
            />
          </div>
        </div>
        <div className="code-footer">
          <span className="sample-feedback" role="status" aria-live="polite" aria-atomic="true">
            {sampleFeedback}
          </span>
          <div id="code-count" className={`counter ${overLimit ? 'warning' : ''}`}>
            {isSubmitting
              ? `${scanLine} / ${lineCount} lines`
              : `${lineCount} ${lineCount === 1 ? 'line' : 'lines'} · ${code.length} chars`}
          </div>
        </div>
      </div>

      <p id="code-help" className="code-instructions">
        Paste a snippet for examination. This demo currently reviews cart-checkout patterns.
      </p>

      <div className="input-meta">
        <div
          id="code-empty-hint"
          className={`field-hint ${showEmptyHint && !isValid ? 'visible' : ''}`}
          role="status"
          aria-live="polite"
          aria-hidden={!showEmptyHint || isValid}
        >
          {!isValid ? 'Code required before review.' : ''}
        </div>
        {contemptBadge && !isValid && (
          <span className="contempt-badge" role="status">CONTEMPT OF CODE · Empty evidence</span>
        )}
      </div>

      {overLimit && (
        <div className="warning-banner" role="status">
          Large evidence submission · Review may take longer. Your code is unchanged.
        </div>
      )}

      <div className="submit-row">
        <button
          type="submit"
          className={`primary-button ${attemptFeedback} ${submitFeedback}`}
          disabled={isSubmitting || isTypingSample}
          aria-disabled={isSubmitting || isTypingSample}
          aria-describedby={!isValid ? 'code-empty-hint' : undefined}
          onFocus={() => {
            if (!isValid) {
              setShowEmptyHint(true)
            }
          }}
          onClick={handleSubmitClick}
        >
          <span>{isSubmitting ? 'Reviewing code...' : isTypingSample ? 'Loading sample...' : 'Begin trial'}</span>
        </button>
      </div>
    </form>
  )
}

export default InputPanel
