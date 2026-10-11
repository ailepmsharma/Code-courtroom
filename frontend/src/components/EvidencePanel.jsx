import { useState } from 'react'

const EvidencePanel = ({ evidence, onSelectLine }) => {
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

  const severityRank = { critical: 0, major: 1, minor: 2, info: 3 }
  const sortedEvidence = [...evidence].sort((left, right) => (
    (severityRank[left.severity.toLowerCase()] ?? 4) - (severityRank[right.severity.toLowerCase()] ?? 4)
  ))
  const severityGroups = sortedEvidence.reduce((groups, item) => {
    const severity = item.severity.toLowerCase()
    groups[severity] ??= []
    groups[severity].push(item)
    return groups
  }, {})

  return (
    <div className="evidence-panel">
      <div className="section-header-row compact">
        <div>
          <div className="eyebrow subtle">Evidence</div>
          <h3>Case findings</h3>
        </div>
      </div>

      <div className="evidence-list">
        {Object.entries(severityGroups).map(([severity, items], groupIndex) => (
          <section className="evidence-severity-group" key={severity} aria-labelledby={`evidence-severity-${groupIndex}`}>
            <h4 id={`evidence-severity-${groupIndex}`}>{severity} findings</h4>
            <div className="evidence-group-items">
              {items.map((item) => {
                const key = `${item.label}-${item.line}`
                const isExpanded = Boolean(expandedItems[key])

                return (
                  <article key={key} className={`evidence-item ${isExpanded ? 'is-expanded' : ''}`}>
                    <button
                      type="button"
                      className="evidence-toggle"
                      aria-expanded={isExpanded}
                      aria-controls={`${key}-content`}
                      onClick={() => {
                        toggleItem(key)
                        if (item.line) onSelectLine?.(item.line)
                      }}
                    >
                      <div className="evidence-head">
                        <span className={`severity-badge severity-${severity}`}>
                          {item.severity}
                        </span>
                        {item.line && <span className="evidence-line">L{item.line}</span>}
                      </div>
                      <div className="evidence-summary">
                        <h3>{item.label}</h3>
                        <span className="evidence-caret" aria-hidden="true">▾</span>
                      </div>
                    </button>

                    <div id={`${key}-content`} className={`evidence-body ${isExpanded ? 'is-open' : ''}`}>
                      <p>{item.description}</p>
                      {Number.isFinite(item.confidence) && (
                        <div className="evidence-meta">
                          <span>Confidence</span>
                          <strong>{item.confidence}%</strong>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default EvidencePanel
