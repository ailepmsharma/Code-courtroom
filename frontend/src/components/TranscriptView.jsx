import ChatBubble from './ChatBubble'
import EvidencePanel from './EvidencePanel'
import LoadingState from './LoadingState'

const TranscriptView = ({ transcript, evidence, isSubmitting }) => (
  <section id="transcript-section" data-section="02" aria-labelledby="transcript-heading" className={`panel transcript-panel ${transcript.length > 0 || isSubmitting ? 'is-visible' : ''}`}>
    <div className="section-header-row compact">
      <div>
        <div className="eyebrow subtle">The Argument</div>
        <h2 id="transcript-heading">Trial transcript</h2>
      </div>
    </div>

    {isSubmitting ? (
      <LoadingState />
    ) : transcript.length > 0 ? (
      <div className="transcript-list">
        {transcript.map((entry) => (
          <ChatBubble key={`${entry.speaker}-${entry.text}`} speaker={entry.speaker} side={entry.side} text={entry.text} />
        ))}
      </div>
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

export default TranscriptView
