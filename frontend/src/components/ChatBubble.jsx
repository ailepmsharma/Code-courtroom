import { useEffect, useState } from 'react'

const TypewriterText = ({ text, className }) => {
  const [visibleWords, setVisibleWords] = useState(0)
  const shouldReduceMotion = document.documentElement.classList.contains('reduce-effects')
  const words = text.match(/\S+\s*/g) ?? []

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleWords((current) => {
        const next = Math.min(words.length, current + 1)
        if (next === words.length) window.clearInterval(timer)
        return next
      })
    }, shouldReduceMotion ? 35 : 90)
    return () => window.clearInterval(timer)
  }, [shouldReduceMotion, text, words.length])

  return (
    <p className={className} aria-label={text}>
      {words.slice(0, visibleWords).map((word, index) => (
        <span className={`argument-word ${index === visibleWords - 1 ? 'is-current' : ''}`} key={`${index}-${word}`}>{word}</span>
      ))}
      {visibleWords < words.length && <span className="typewriter-caret" aria-hidden="true">▍</span>}
    </p>
  )
}

const ChatBubble = ({ speaker, side, text, entry }) => {
  const payload = entry ?? { speaker, side, text }
  const isProsecutor = payload.side === 'prosecutor'
  const isDefense = payload.side === 'defense'
  const roleLabel = isProsecutor ? 'PROSECUTOR' : isDefense ? 'DEFENSE ATTORNEY' : 'THE JUDGE'
  const caption = isProsecutor ? 'For the state' : isDefense ? 'For the defense' : 'Court record'
  const [expanded, setExpanded] = useState({})
  const severityRank = { critical: 0, major: 1, minor: 2 }
  const items = [...(payload.charges ?? payload.defenses ?? [])].sort((left, right) => (
    (severityRank[left.severity?.toLowerCase()] ?? 3) - (severityRank[right.severity?.toLowerCase()] ?? 3)
  ))

  const toggleItem = (index) => {
    setExpanded((current) => ({
      ...current,
      [index]: !current[index],
    }))
  }

  return (
    <article className={`speech-bubble ${payload.side}`} aria-label={`${payload.speaker ?? speaker} statement`}>
      <div className="speaker-row">
        <span className={`speaker-channel-mark ${payload.side}`} aria-hidden="true" />
        <div className="speaker-meta">
          <span className="speaker-tag">{roleLabel}</span>
          <small>{caption}</small>
        </div>
      </div>

      {payload.opening_statement && (
        <TypewriterText key={payload.opening_statement} className="opening-statement" text={payload.opening_statement} />
      )}

      {payload.text && !payload.opening_statement && <TypewriterText key={payload.text} className="opening-statement" text={payload.text} />}

      {items.length > 0 ? (
        <div className="argument-list" aria-label={`${payload.speaker ?? speaker} evidence`}>
          {items.map((item, index) => {
            const isOpen = Boolean(expanded[index])
            const label = item.severity ? item.severity.toUpperCase() : 'NOTE'
            const itemId = `argument-${payload.side}-${index}`

            return (
              <div
                className={`argument-item ${isOpen ? 'open' : ''}`}
                key={`${payload.speaker ?? speaker}-${item.title ?? item.label ?? index}`}
                style={{ '--reveal-order': index }}
              >
                <button
                  type="button"
                  className="argument-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`${itemId}-details`}
                  onClick={() => toggleItem(index)}
                >
                  <span className={`severity-badge severity-${(item.severity ?? 'minor').toLowerCase()}`}>
                    {label}
                  </span>
                  <span className="argument-title">{item.title ?? item.label}</span>
                  <span className="argument-caret" aria-hidden="true">▾</span>
                </button>

                <div id={`${itemId}-details`} className={`argument-body ${isOpen ? 'is-open' : ''}`}>
                  <div className="argument-body-inner">
                    {item.line ? <span className="line-chip">L{item.line}</span> : null}
                    <p>{item.description ?? item.detail ?? item.text ?? 'No further detail was provided.'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : payload.side !== 'judge' ? (
        <p className="argument-empty">No specific charges or defenses were entered for this statement.</p>
      ) : null}

      {payload.closing_statement && (
        <div style={{ '--argument-count': items.length }}>
          <TypewriterText key={payload.closing_statement} className="closing-statement" text={payload.closing_statement} />
        </div>
      )}
    </article>
  )
}

export default ChatBubble
