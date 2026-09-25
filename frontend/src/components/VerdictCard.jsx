const VerdictCard = ({ verdict }) => (
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
        <div className="empty-icon" aria-hidden="true">
          🔨
        </div>
        <p>Awaiting final ruling…</p>
      </div>
    )}
  </section>
)

export default VerdictCard
