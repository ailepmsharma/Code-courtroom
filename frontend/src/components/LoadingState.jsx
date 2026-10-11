import { useEffect, useState } from 'react'
import { loadingLines } from '../data/reviewCopy.js'

const stageCopy = {
  prosecutor: {
    label: 'PROSECUTION',
    message: 'Prosecutor is building their case',
    detail: 'Tracing the submitted evidence for actionable findings.',
  },
  defense: {
    label: 'DEFENSE',
    message: 'Defense is preparing a rebuttal',
    detail: 'Weighing the findings against the submitted code.',
  },
  judge: {
    label: 'CHAMBERS',
    message: 'The Judge is deliberating',
    detail: 'Considering both arguments before issuing a ruling.',
  },
}

const LoadingState = ({ stage = 'prosecutor', progress = {} }) => {
  const copy = stageCopy[stage] ?? stageCopy.prosecutor
  const [lineIndex, setLineIndex] = useState(0)
  const completedStages = Object.values(progress).filter((status) => status === 'complete').length
  const completionPercent = Math.round(completedStages / 3 * 100)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % loadingLines.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  return (
  <div className={`loading-state speech-bubble ${stage}`} role="status" aria-live="polite">
    <div>
      <span className="loading-kicker">{copy.label}</span>
      <strong>{copy.message}<span className="loading-dots" aria-hidden="true">...</span></strong>
      <p>{loadingLines[lineIndex]}</p>
      <div className="loading-meter">
        <span className="loading-meter-label">TRIAL SEQUENCE <b>{completionPercent}%</b></span>
        <span
          className="loading-meter-track"
          role="progressbar"
          aria-label="Trial stages completed"
          aria-valuemin="0"
          aria-valuemax="3"
          aria-valuenow={completedStages}
        >
          <i style={{ width: `${completionPercent}%` }} />
        </span>
      </div>
    </div>
  </div>
  )
}

export default LoadingState
