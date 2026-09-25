const InputPanel = ({ code, onCodeChange, onSubmit, onLoadSample, isSubmitting, isValid, overLimit }) => (
  <section id="input-section" className="panel input-panel">
    <div className="section-header-row">
      <div>
        <div className="eyebrow subtle">Exhibit A</div>
        <h2>Submit evidence</h2>
      </div>
      <span className="language-pill">Auto-detect</span>
    </div>

    <div className="quick-samples" aria-label="Sample code quick-fill options">
      <button type="button" className="sample-button" onClick={() => onLoadSample('buggy')}>
        Try Buggy Code 🐛
      </button>
      <button type="button" className="sample-button" onClick={() => onLoadSample('clean')}>
        Try Clean Code ✨
      </button>
    </div>

    <label htmlFor="code-input" className="sr-only">
      Evidence to review
    </label>
    <textarea
      id="code-input"
      value={code}
      onChange={(event) => onCodeChange(event.target.value)}
      placeholder="// Paste the code you'd like to put on trial…"
      aria-describedby="code-help"
    />

    <div className="input-meta">
      <div id="code-help" className={`field-hint ${!isValid ? 'visible' : ''}`}>
        Add some code before you put it on trial
      </div>
      <div className={`counter ${overLimit ? 'warning' : ''}`}>{code.length} chars</div>
    </div>

    {overLimit && (
      <div className="warning-banner" role="status">
        This snippet is long. Review will still work, but a shorter sample may be easier to inspect.
      </div>
    )}

    <div className="submit-row">
      <button type="button" className="primary-button" disabled={!isValid || isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Reviewing evidence...' : 'Put It On Trial ⚖️'}
      </button>
    </div>
  </section>
)

export default InputPanel
