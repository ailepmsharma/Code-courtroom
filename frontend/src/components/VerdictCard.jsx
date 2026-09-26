const VerdictCard = ({ verdict }) => (
  <section id="verdict-section" data-section="03" aria-labelledby="verdict-heading" className={`panel verdict-panel ${verdict ? 'is-visible' : ''}`}>
    <div className="section-header-row compact">
      <div>
        <div className="eyebrow subtle">Final ruling</div>
        <h2 id="verdict-heading">Verdict</h2>
      </div>
      {verdict && <span className="score-pill">{verdict.score === null ? 'Unscored' : `${verdict.score}/100`}</span>}
    </div>

    {verdict ? (
      <div className={`verdict-card verdict-result-${verdict.resultType}`}>
        <div className="ruling-seal" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none" focusable="false">
            <path d="M20 6v24M11 11h18M20 9l-8 13m8-13 8 13M8 22h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5Zm16 0h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5ZM14 33h12" />
          </svg>
        </div>
        <div className="verdict-header">
          <span className="verdict-status">{verdict.status}</span>
          <strong>{verdict.verdict}</strong>
        </div>

        <p className="verdict-summary">{verdict.summary}</p>

        <div className="verdict-grid">
          <div className="verdict-box">
            <span>Detected</span>
            <strong>{verdict.detected}</strong>
          </div>
          <div className="verdict-box">
            <span>Impact</span>
            <strong>{verdict.impact}</strong>
          </div>
        </div>

        <div className="recommendation-box">
          <span>Recommended action</span>
          <p>{verdict.recommendation}</p>
        </div>
      </div>
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
