import { useState } from 'react'

const InputPanel = ({ code, onCodeChange, onSubmit, onLoadSample, isSubmitting, isValid, overLimit, textareaRef }) => {
  const [copyFeedback, setCopyFeedback] = useState('')
  const lineCount = code.trim() ? code.split(/\r\n|\r|\n/).length : 0

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
          <div className="eyebrow subtle">Evidence file · 01</div>
          <h2>Code evidence</h2>
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
          <div className="editor-heading">
            <span className="editor-led" aria-hidden="true" />
            <label htmlFor="code-input" className="editor-label">Exhibit A · Source code</label>
          </div>
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
          disabled={isSubmitting}
        />
        <div className="code-footer">
          <div id="code-count" className={`counter ${overLimit ? 'warning' : ''}`}>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {code.length} chars
          </div>
        </div>
      </div>

      <p id="code-help" className="code-instructions">
        Paste a snippet for examination. This demo currently reviews cart-checkout patterns.
      </p>

      <div className="input-meta">
        <div id="code-empty-hint" className={`field-hint ${!isValid ? 'visible' : ''}`} aria-hidden={isValid}>
          Add some code before you put it on trial
        </div>
      </div>

      {overLimit && (
        <div className="warning-banner" role="status">
          This snippet is long. Review will still work, but a shorter sample may be easier to inspect.
        </div>
      )}

      <div className="submit-row">
        <button
          type="submit"
          className="primary-button"
          disabled={!isValid || isSubmitting}
          aria-describedby={!isValid ? 'code-empty-hint' : undefined}
        >
          {isSubmitting ? 'Reviewing evidence...' : 'Put It On Trial ⚖️'}
        </button>
      </div>
    </form>
  )
}

export default InputPanel
