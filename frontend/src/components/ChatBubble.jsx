const ChatBubble = ({ speaker, side, text }) => (
  <div className={`speech-bubble ${side}`}>
    <span className="speaker-tag">{speaker}</span>
    <p>{text}</p>
  </div>
)

export default ChatBubble
