const cast = [
  { id: 'prosecutor', label: 'PROSECUTION', title: 'The case against' },
  { id: 'defense', label: 'DEFENSE', title: 'The case for' },
  { id: 'judge', label: 'JUDGE', title: 'The ruling' },
]

const CourtroomCast = ({ activeSpeaker }) => (
  <div className="courtroom-cast" aria-label="Trial voice channels">
    {cast.map((channel) => (
      <div
        key={channel.id}
        className={`cast-character ${channel.id} ${activeSpeaker === channel.id ? 'is-active' : ''}`}
        aria-current={activeSpeaker === channel.id ? 'true' : undefined}
      >
        <span className="cast-label">{channel.label}</span>
        <strong>{channel.title}</strong>
        <span className="cast-waveform" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--wave-index': index }} />)}
        </span>
      </div>
    ))}
  </div>
)

export default CourtroomCast
