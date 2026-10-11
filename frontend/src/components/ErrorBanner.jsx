const ErrorBanner = ({ message, onRetry, onDismiss, isRetrying = false }) => {
  if (!message) {
    return null
  }

  return (
    <aside className="trial-error" role="alert">
      <p>{message}</p>
      <div className="trial-error-actions">
        {onRetry && (
          <button type="button" className="trial-retry-button" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? 'Retrying…' : 'Retry'}
          </button>
        )}
        {onDismiss && (
          <button type="button" className="trial-error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
            ×
          </button>
        )}
      </div>
    </aside>
  )
}

export default ErrorBanner
