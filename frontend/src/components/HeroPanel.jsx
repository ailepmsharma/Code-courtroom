const HeroPanel = ({ onLoadSample }) => (
  <header className="panel hero-panel">
    <div className="hero-copy">
      <div className="eyebrow">Civic-grade review workflow</div>
      <h1 id="page-title">Put your code on trial.</h1>
      <p className="hero-text">
        Review fragile logic, surface the root cause, and move from detection to decision in one trusted workflow.
      </p>

      <div className="hero-actions">
        <a href="#input-section" className="primary-link">
          Start a review
        </a>
        <button type="button" className="secondary-link" onClick={() => onLoadSample('clean')}>
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
          <span className="status-dot" aria-hidden="true" />
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
  </header>
)

export default HeroPanel
