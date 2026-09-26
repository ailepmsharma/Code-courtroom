import { useState } from 'react'

const EvidencePanel = ({ evidence }) => {
  const [expandedItems, setExpandedItems] = useState({})

  if (!evidence || evidence.length === 0) {
    return null
  }

  const toggleItem = (key) => {
    setExpandedItems((current) => ({
      ...current,
      [key]: !current[key],
    }))
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
        {evidence.map((item) => {
          const key = `${item.label}-${item.line}`
          const isExpanded = Boolean(expandedItems[key])

          return (
            <article key={key} className={`evidence-item ${isExpanded ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className="evidence-toggle"
                aria-expanded={isExpanded}
                aria-controls={`${key}-content`}
                onClick={() => toggleItem(key)}
              >
                <div className="evidence-head">
                  <span className={`severity-badge severity-${item.severity.toLowerCase()}`}>
                    {item.severity}
                  </span>
                  <span className="evidence-line">L{item.line}</span>
                </div>
                <div className="evidence-summary">
                  <h3>{item.label}</h3>
                  <span className="evidence-caret" aria-hidden="true">▾</span>
                </div>
              </button>

              <div id={`${key}-content`} className={`evidence-body ${isExpanded ? 'is-open' : ''}`}>
                <p>{item.description}</p>
                <div className="evidence-meta">
                  <span>Confidence</span>
                  <strong>{item.confidence}%</strong>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default EvidencePanel
