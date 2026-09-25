const VerdictCard = ({ verdict }) => (
  <section id="verdict-section" aria-labelledby="verdict-heading" className={`panel verdict-panel ${verdict ? 'is-visible' : ''}`}>
    <div className="section-header-row compact">
      <div>
        <div className="eyebrow subtle">Final ruling</div>
        <h2 id="verdict-heading">Verdict</h2>
      </div>
      {verdict && <span className="score-pill">{verdict.score}/100</span>}
    </div>

    {verdict ? (
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
