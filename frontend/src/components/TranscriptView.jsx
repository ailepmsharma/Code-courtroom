import { useState } from 'react'
import ChatBubble from './ChatBubble'
import EvidencePanel from './EvidencePanel'
import LoadingState from './LoadingState'

const roleFilters = [
  { label: 'All', value: 'all' },
  { label: 'Prosecutor', value: 'prosecutor' },
  { label: 'Defense', value: 'defense' },
  { label: 'Judge', value: 'judge' },
]

const TranscriptView = ({ transcript, evidence, isSubmitting, loadingStage }) => {
  const [activeRole, setActiveRole] = useState('all')
  const visibleTranscript = activeRole === 'all'
    ? transcript
    : transcript.filter((entry) => entry.side === activeRole)

  return (
    <section id="transcript-section" data-section="02" aria-labelledby="transcript-heading" className={`panel transcript-panel ${transcript.length > 0 || isSubmitting ? 'is-visible' : ''}`}>
      <div className="section-header-row compact">
        <div>
          <div className="eyebrow subtle">The Argument</div>
          <h2 id="transcript-heading">Trial transcript</h2>
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="transcript-role-tabs" role="group" aria-label="Filter transcript by courtroom role">
          {roleFilters.map((role) => (
            <button
              key={role.value}
              type="button"
              aria-pressed={activeRole === role.value}
              className={`transcript-role-tab ${activeRole === role.value ? 'is-active' : ''}`}
              onClick={() => setActiveRole(role.value)}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}

      {transcript.length > 0 ? (
        <div className="transcript-list" aria-live="polite">
          {visibleTranscript.map((entry) => (
            <ChatBubble
              key={`${entry.side}-${entry.speaker}`}
              speaker={entry.speaker}
              side={entry.side}
              text={entry.text}
              entry={entry}
            />
          ))}
          {isSubmitting && <LoadingState stage={loadingStage} />}
        </div>
      ) : isSubmitting ? (
        <LoadingState stage={loadingStage} />
      ) : (
        <article className="empty-state" aria-labelledby="transcript-empty-title">
          <div className="empty-icon" aria-hidden="true">
            §
          </div>
          <h3 id="transcript-empty-title">Awaiting trial…</h3>
          <p>Submit a case to begin the examination.</p>
        </article>
      )}
      <EvidencePanel evidence={evidence} />
    </section>
  )
}

export default TranscriptView
