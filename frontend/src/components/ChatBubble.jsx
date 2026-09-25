const ChatBubble = ({ speaker, side, text }) => (
  <article className={`speech-bubble ${side}`} aria-label={`${speaker} statement`}>
    <span className="speaker-tag">{speaker}</span>
    <p>{text}</p>
  </article>
)

export default ChatBubble
