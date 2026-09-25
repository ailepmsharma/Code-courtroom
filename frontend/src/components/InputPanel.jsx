import { useState } from 'react'

const InputPanel = ({ code, onCodeChange, onSubmit, onLoadSample, isSubmitting, isValid, overLimit, textareaRef }) => {
  const [copyFeedback, setCopyFeedback] = useState('')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyFeedback('Copied')
    } catch {
      setCopyFeedback('Unavailable')
    }
  }

  return (
    <form
      className="panel input-panel"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="section-header-row">
        <div>
          <div className="eyebrow subtle">Exhibit A</div>
          <h2>Submit evidence</h2>
        </div>
        <span className="language-pill">Cart-flow demo</span>
      </div>

      <div className="quick-samples" aria-label="Sample code quick-fill options">
        <button type="button" className="sample-button" onClick={() => onLoadSample('buggy')}>
          Try Buggy Code 🐛
        </button>
        <button type="button" className="sample-button" onClick={() => onLoadSample('clean')}>
          Try Clean Code ✨
        </button>
      </div>

      <div className="code-workbench">
        <div className="code-toolbar">
          <label htmlFor="code-input" className="editor-label">Code under review</label>
          <button type="button" className="copy-button" onClick={handleCopy} disabled={!isValid} aria-live="polite">
            {copyFeedback || 'Copy code'}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          id="code-input"
          className="code-input"
          value={code}
          onChange={(event) => {
            onCodeChange(event.target.value)
            setCopyFeedback('')
          }}
          placeholder="// Paste the code you'd like to put on trial…"
          aria-describedby="code-help code-count"
          spellCheck="false"
        />
      </div>

      <p id="code-help" className="sr-only">
        Paste a code snippet you would like examined for bugs or risky behavior.
      </p>

      <div className="input-meta">
        <div className={`field-hint ${!isValid ? 'visible' : ''}`} aria-hidden={isValid}>
          Add some code before you put it on trial
        </div>
        <div id="code-count" className={`counter ${overLimit ? 'warning' : ''}`}>{code.length} chars</div>
      </div>

      {overLimit && (
        <div className="warning-banner" role="status">
          This snippet is long. Review will still work, but a shorter sample may be easier to inspect.
        </div>
      )}

      <div className="submit-row">
        <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Reviewing evidence...' : 'Put It On Trial ⚖️'}
        </button>
      </div>
    </form>
  )
}

export default InputPanel
