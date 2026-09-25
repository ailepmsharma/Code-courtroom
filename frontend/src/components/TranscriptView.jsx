import ChatBubble from './ChatBubble'
import LoadingState from './LoadingState'

const TranscriptView = ({ transcript, isSubmitting }) => (
  <section id="transcript-section" className={`panel transcript-panel ${transcript.length > 0 || isSubmitting ? 'is-visible' : ''}`}>
    <div className="section-header-row compact">
      <div>
        <div className="eyebrow subtle">The Argument</div>
        <h2>Trial transcript</h2>
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
      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ⚖️
        </div>
        <p>Awaiting trial…</p>
      </div>
    )}
  </section>
)

export default TranscriptView
