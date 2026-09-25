const LoadingState = () => (
  <div className="loading-state" aria-hidden="true">
    <span className="spinner" aria-hidden="true" />
    <div>
      <strong>Analyzing submitted code...</strong>
      <p>Inspecting evidence, checking state flow, and preparing the verdict.</p>
    </div>
  </div>
)

export default LoadingState
