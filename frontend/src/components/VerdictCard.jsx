import { getVerdictPresentation } from '../data/verdictPresentation.js'
import { useState } from 'react'

const SentenceChecklist = ({ items }) => {
  const [completed, setCompleted] = useState([])
  const progress = items.length ? Math.round(completed.length / items.length * 100) : 0

  const toggleItem = (index) => {
    setCompleted((current) => (
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    ))
  }

  return (
    <section className={`sentence-section ${progress === 100 ? 'is-complete' : ''}`} aria-labelledby="sentence-heading">
      <div className="sentence-heading-row">
        <h3 id="sentence-heading">Recommended fixes</h3>
        <span>{completed.length}/{items.length} filed</span>
      </div>
      <div
        className="sentence-progress"
        role="progressbar"
        aria-label="Fixes completed"
        aria-valuemin="0"
        aria-valuemax={items.length}
        aria-valuenow={completed.length}
        style={{ '--sentence-progress': `${progress}%` }}
      />
      <ol className="sentence-list">
        {items.map((sentence, index) => (
          <li key={`${sentence}-${index}`} className={completed.includes(index) ? 'is-complete' : ''}>
            <button
              type="button"
              className="sentence-toggle"
              aria-pressed={completed.includes(index)}
              aria-label={`${completed.includes(index) ? 'Mark incomplete' : 'Mark complete'}: ${sentence}`}
              onClick={() => toggleItem(index)}
            >
              <span className="sentence-number" aria-hidden="true">{completed.includes(index) ? '✓' : index + 1}</span>
              <span>{sentence}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

const VerdictCard = ({ verdict, onTryAgain }) => (
  <section id="verdict-section" data-section="03" aria-labelledby="verdict-heading" className={`panel verdict-panel ${verdict ? 'is-visible' : ''} ${verdict?.resultType === 'review' ? 'has-limited-demo' : ''}`}>
    <div className="section-header-row compact">
      <div>
        <div className="eyebrow subtle">Final ruling</div>
        <h2 id="verdict-heading">Verdict</h2>
      </div>
      {verdict && <span className="score-pill">{verdict.resultType !== 'review' && Number.isFinite(verdict.score) ? `${verdict.score}/100` : 'Unscored'}</span>}
    </div>

    {verdict ? (
      <article className={`verdict-card verdict-result-${verdict.resultType}`} aria-labelledby="verdict-result-label" aria-live="polite" aria-atomic="true">
        <div className="verdict-card-topline">
          <div className="ruling-author">
            <div className="ruling-seal" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" focusable="false">
                <path d="M20 6v24M11 11h18M20 9l-8 13m8-13 8 13M8 22h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5Zm16 0h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5ZM14 33h12" />
              </svg>
            </div>
            <div>
              <strong>THE JUDGE</strong>
              <span>Presiding officer</span>
            </div>
          </div>
          <span className="ruling-index" aria-hidden="true">RULING / 01</span>
        </div>

        <div className="verdict-header">
          <span
            className={`verdict-status verdict-status-${getVerdictPresentation(verdict.resultType).className}`}
            role="status"
            aria-label={getVerdictPresentation(verdict.resultType).accessibleName}
          >
            <span className="verdict-mark" aria-hidden="true">{getVerdictPresentation(verdict.resultType).symbol}</span>
            {verdict.resultType === 'review' ? 'LIMITED DEMO' : verdict.status}
          </span>
          <strong id="verdict-result-label">{verdict.verdict}</strong>
        </div>

        {verdict.resultType === 'review' ? (
          <div className="unscored-notice" role="note">
            Demo mode. Not an approval.
            <div className="unscored-ring" aria-label="Unscored limited demo result"><span>UNSCORED</span></div>
          </div>
        ) : Number.isFinite(verdict.score) ? (
          <div className={`score-ring score-ring-${verdict.resultType}`} style={{ '--score-value': `${verdict.score}%` }} aria-label={`Score ${verdict.score} out of 100`}>
            <span>{verdict.score}<small>/100</small></span>
          </div>
        ) : null}

        {verdict.summary && <p className="verdict-summary">{verdict.summary}</p>}

        <div className="reasoning-box">
          <span>Reasoning</span>
          <p>{verdict.reasoning ?? 'The court did not provide additional reasoning.'}</p>
        </div>

        {(verdict.detected || verdict.impact) && (
          <div className="verdict-grid">
            {verdict.detected && (
              <div className="verdict-box">
                <span>Detected</span>
                <strong>{verdict.detected}</strong>
              </div>
            )}
            {verdict.impact && (
              <div className="verdict-box">
                <span>Impact</span>
                <strong>{verdict.impact}</strong>
              </div>
            )}
          </div>
        )}

        {verdict.sentence.length > 0 && (
          <SentenceChecklist key={`${verdict.verdict}-${verdict.score}`} items={verdict.sentence} />
        )}

        {verdict.recommendation && (
          <div className="recommendation-box">
            <span>Recommended action</span>
            <p>{verdict.recommendation}</p>
          </div>
        )}

        <div className="verdict-actions">
          <button type="button" className="reset-trial-button" onClick={onTryAgain}>
            <span aria-hidden="true">↺</span>
            File an appeal
          </button>
        </div>
      </article>
    ) : (
      <article className="empty-state" aria-labelledby="verdict-empty-title">
        <div className="empty-icon" aria-hidden="true">
          §
        </div>
        <h3 id="verdict-empty-title">Awaiting trial…</h3>
        <p>The court will issue a ruling when examination is complete.</p>
      </article>
    )}
  </section>
)

export default VerdictCard
