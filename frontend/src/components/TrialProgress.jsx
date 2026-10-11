const stages = [
  { key: 'prosecution', label: 'Prosecution' },
  { key: 'defense', label: 'Defense' },
  { key: 'verdict', label: 'Verdict' },
]

const stateLabels = {
  pending: 'Pending',
  active: 'In progress',
  complete: 'Complete',
  error: 'Could not complete',
}

const TrialProgress = ({ progress }) => (
  <ol className="trial-progress" aria-label="Trial progress">
    {stages.map((stage, index) => {
      const status = progress[stage.key] ?? 'pending'

      return (
        <li key={stage.key} className={`trial-progress-step is-${status}`} aria-current={status === 'active' ? 'step' : undefined}>
          <span className="trial-progress-number" aria-hidden="true">0{index + 1}</span>
          <span className="trial-progress-label">{stage.label}</span>
          <span className={`trial-progress-status status-${status}`} aria-hidden="true">{stateLabels[status]}</span>
          <span className="sr-only">{stateLabels[status]}</span>
        </li>
      )
    })}
  </ol>
)

export default TrialProgress
