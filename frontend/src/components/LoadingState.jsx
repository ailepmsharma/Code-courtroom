const stageCopy = {
  prosecutor: {
    label: 'PROSECUTION',
    message: 'Prosecutor is building their case',
    detail: 'Tracing the submitted evidence for actionable findings.',
    icon: '😈',
  },
  defense: {
    label: 'DEFENSE',
    message: 'Defense is preparing a rebuttal',
    detail: 'Weighing the findings against the submitted code.',
    icon: '😇',
  },
  judge: {
    label: 'CHAMBERS',
    message: 'The Judge is deliberating',
    detail: 'Considering both arguments before issuing a ruling.',
    icon: '⚖️',
  },
}

const LoadingState = ({ stage = 'prosecutor' }) => {
  const copy = stageCopy[stage] ?? stageCopy.prosecutor

  return (
  <div className={`loading-state speech-bubble ${stage}`} role="status" aria-live="polite">
    <span className={`speaker-avatar ${stage}`} aria-hidden="true">{copy.icon}</span>
    <div>
      <span className="loading-kicker">{copy.label}</span>
      <strong>{copy.message}<span className="loading-dots" aria-hidden="true">...</span></strong>
      <p>{copy.detail}</p>
    </div>
  </div>
  )
}

export default LoadingState
