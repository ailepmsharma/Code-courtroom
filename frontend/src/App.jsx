import { useRef, useState } from 'react'
import { buggyCodeSample, cleanCodeSample } from './data/sampleCode.js'
import './App.css'

const verdictSummary = {
  status: 'Issue found',
  score: 92,
  verdict: 'Needs patch before release',
  summary:
    'The cart is mutated by reassigning the array reference inside checkout(), which can silently clear user state and break the purchase flow.',
  recommendation:
    'Clone the current cart before reset and return a new array instead of mutating the original reference in place.',
}

function App() {
  const [code, setCode] = useState(buggyCodeSample)
  const [transcript, setTranscript] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef(null)

  const charCount = code.length
  const isValid = code.trim().length > 0
  const overLimit = charCount > 4000

  const handleSampleLoad = (sample) => {
    setCode(sample)
    setTranscript([])
    setVerdict(null)
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(sample.length, sample.length)
    })
  }

  const handleSubmit = () => {
    if (!isValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setTranscript([])
    setVerdict(null)

    window.setTimeout(() => {
      const nextTranscript = [
        {
          speaker: 'Prosecutor',
          side: 'prosecutor',
          text:
            'The checkout routine reassigns the cart array instead of resetting state safely. That creates a mutable reference leak and can wipe the user session mid-flow.',
        },
        {
          speaker: 'Defense',
          side: 'defense',
          text:
            'The mutation is isolated to the reset step, but the original array object is still being exposed outside the function boundary.',
        },
        {
          speaker: 'Judge',
          side: 'judge',
          text:
            'This is a clear state-management issue. The ruling favors a defensive clone and a reset that does not mutate shared references.',
        },
      ]

      setTranscript(nextTranscript)
      setIsSubmitting(false)

      window.requestAnimationFrame(() => {
        document.getElementById('transcript-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }, 800)

    window.setTimeout(() => {
      setVerdict(verdictSummary)

      window.requestAnimationFrame(() => {
        document.getElementById('verdict-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }, 1800)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Code Courtroom brand">
          <span className="brand-mark">⚖️</span>
          <div>
            <span className="brand-name">Code Courtroom</span>
            <span className="brand-tag">Your code is on trial</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="nav-link">
            Case log
          </button>
          <button type="button" className="nav-link ghost">
            Live verdicts
          </button>
        </div>
      </header>

      <main className="page-shell">
        <section className="panel hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">Civic-grade review workflow</div>
            <h1>Turn real-world bugs into real-world action.</h1>
            <p className="hero-text">
              Review fragile logic, surface the root cause, and move from detection to
              decision in one trusted workflow.
            </p>

            <div className="hero-actions">
              <a href="#input-section" className="primary-link">
                Start a review
              </a>
              <button type="button" className="secondary-link" onClick={() => handleSampleLoad(cleanCodeSample)}>
                View clean sample
              </button>
            </div>

            <div className="hero-metrics" aria-label="Platform metrics">
              <div>
                <strong>94%</strong>
                <span>Issue detection</span>
              </div>
              <div>
                <strong>2.4s</strong>
                <span>Average review</span>
              </div>
              <div>
                <strong>11k</strong>
                <span>Cases reviewed</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Case overview preview">
            <div className="mini-panel">
              <div className="mini-header">
                <span className="status-dot" />
                <span>Case pulse</span>
              </div>

              <div className="mini-bars" aria-hidden="true">
                <span style={{ height: '32%' }} />
                <span style={{ height: '58%' }} />
                <span style={{ height: '81%' }} />
                <span style={{ height: '66%' }} />
                <span style={{ height: '91%' }} />
                <span style={{ height: '77%' }} />
              </div>
            </div>

            <div className="mini-summary">
              <div className="summary-line">
                <span>Critical risk</span>
                <span className="risk-pill">High</span>
              </div>
              <div className="summary-line">
                <span>Root cause</span>
                <span>State mutation</span>
              </div>
              <div className="summary-line">
                <span>Recommendation</span>
                <span>Clone before reset</span>
              </div>
            </div>
          </div>
        </section>

        <section id="input-section" className="panel input-panel">
          <div className="section-header-row">
            <div>
              <div className="eyebrow subtle">Exhibit A</div>
              <h2>Submit evidence</h2>
            </div>
            <span className="language-pill">Auto-detect</span>
          </div>

          <div className="quick-samples" aria-label="Sample code quick-fill options">
            <button type="button" className="sample-button" onClick={() => handleSampleLoad(buggyCodeSample)}>
              Try Buggy Code 🐛
            </button>
            <button type="button" className="sample-button" onClick={() => handleSampleLoad(cleanCodeSample)}>
              Try Clean Code ✨
            </button>
          </div>

          <label htmlFor="code-input" className="sr-only">
            Evidence to review
          </label>
          <textarea
            id="code-input"
            ref={textareaRef}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="// Paste the code you'd like to put on trial…"
            aria-describedby="code-help"
          />

          <div className="input-meta">
            <div id="code-help" className={`field-hint ${!isValid ? 'visible' : ''}`}>
              Add some code before you put it on trial
            </div>
            <div className={`counter ${overLimit ? 'warning' : ''}`}>
              {charCount} chars
            </div>
          </div>

          {overLimit && (
            <div className="warning-banner" role="status">
              This snippet is long. Review will still work, but a shorter sample may be easier to inspect.
            </div>
          )}

          <div className="submit-row">
            <button
              type="button"
              className="primary-button"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Reviewing evidence...' : 'Put It On Trial ⚖️'}
            </button>
          </div>
        </section>

        <section id="transcript-section" className={`panel transcript-panel ${transcript.length > 0 || isSubmitting ? 'is-visible' : ''}`}>
          <div className="section-header-row compact">
            <div>
              <div className="eyebrow subtle">The Argument</div>
              <h2>Trial transcript</h2>
            </div>
          </div>

          {isSubmitting ? (
            <div className="loading-state" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <div>
                <strong>Analyzing evidence</strong>
                <p>Cross-checking mutation risks, state flow, and release impact.</p>
              </div>
            </div>
          ) : transcript.length > 0 ? (
            <div className="transcript-list">
              {transcript.map((entry) => (
                <div key={`${entry.speaker}-${entry.text}`} className={`speech-bubble ${entry.side}`}>
                  <span className="speaker-tag">{entry.speaker}</span>
                  <p>{entry.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⚖️</div>
              <p>Awaiting trial…</p>
            </div>
          )}
        </section>

        <section id="verdict-section" className={`panel verdict-panel ${verdict ? 'is-visible' : ''}`}>
          {verdict ? (
            <>
              <div className="section-header-row compact">
                <div>
                  <div className="eyebrow subtle">Final ruling</div>
                  <h2>Verdict</h2>
                </div>
                <span className="score-pill">{verdict.score}/100</span>
              </div>

              <div className="verdict-card">
                <div className="verdict-header">
                  <span className="verdict-status">{verdict.status}</span>
                  <strong>{verdict.verdict}</strong>
                </div>

                <p className="verdict-summary">{verdict.summary}</p>

                <div className="verdict-grid">
                  <div className="verdict-box">
                    <span>Detected</span>
                    <strong>State mutation</strong>
                  </div>
                  <div className="verdict-box">
                    <span>Impact</span>
                    <strong>Checkout breakage</strong>
                  </div>
                </div>

                <div className="recommendation-box">
                  <span>Recommended action</span>
                  <p>{verdict.recommendation}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔨</div>
              <p>Awaiting final ruling…</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
