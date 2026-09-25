const HeroPanel = ({ onLoadSample }) => (
  <header className="panel hero-panel">
    <div className="hero-copy">
      <div className="eyebrow">AI-assisted code examination</div>
      <h1 id="page-title">Put your code on trial.</h1>
      <p className="hero-text">
        Submit a code sample. Hear both sides of the argument. Leave with a clear, actionable ruling.
      </p>

      <div className="hero-actions">
        <a href="#input-section" className="primary-link">
          Start a review
        </a>
        <button type="button" className="secondary-link" onClick={() => onLoadSample('clean')}>
          View clean sample
        </button>
      </div>

      <div className="hero-process" aria-label="Review process">
        <span>Evidence</span>
        <span aria-hidden="true" />
        <span>Arguments</span>
        <span aria-hidden="true" />
        <span>Ruling</span>
      </div>
    </div>

    <div className="hero-visual" aria-label="Courtroom review stages">
      <div className="docket-sheet">
        <div className="docket-heading">
          <span>REVIEW PROTOCOL</span>
          <span>CC / 001</span>
        </div>

        <div className="docket-stage">
          <span>01</span>
          <div>
            <strong>Examine the evidence</strong>
            <small>Trace behavior and identify risk</small>
          </div>
        </div>
        <div className="docket-stage">
          <span>02</span>
          <div>
            <strong>Hear both arguments</strong>
            <small>Compare prosecution and defense</small>
          </div>
        </div>
        <div className="docket-stage">
          <span>03</span>
          <div>
            <strong>Deliver a ruling</strong>
            <small>Get a reasoned next step</small>
          </div>
        </div>
      </div>
    </div>
  </header>
)

export default HeroPanel
