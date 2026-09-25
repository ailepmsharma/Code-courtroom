const EvidencePanel = ({ evidence }) => {
  if (!evidence || evidence.length === 0) {
    return null
  }

  return (
    <div className="evidence-panel">
      <div className="section-header-row compact">
        <div>
          <div className="eyebrow subtle">Evidence</div>
          <h3>Case findings</h3>
        </div>
      </div>

      <div className="evidence-list">
        {evidence.map((item) => (
          <article key={`${item.label}-${item.line}`} className="evidence-item">
            <div className="evidence-head">
              <span className={`severity-badge severity-${item.severity.toLowerCase()}`}>
                {item.severity}
              </span>
              <span className="evidence-line">L{item.line}</span>
            </div>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <div className="evidence-meta">
              <span>Confidence</span>
              <strong>{item.confidence}%</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default EvidencePanel
