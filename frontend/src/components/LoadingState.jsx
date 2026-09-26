const LoadingState = () => (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="loading-seal" aria-hidden="true">§</span>
    <div>
      <span className="loading-kicker">Proceedings underway</span>
      <strong>Reviewing cart-state patterns<span className="loading-dots" aria-hidden="true">...</span></strong>
      <p>Local rules are examining the submitted evidence.</p>
    </div>
  </div>
)

export default LoadingState
