const ErrorBanner = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    <div className="warning-banner" role="alert">
      {message}
    </div>
  )
}

export default ErrorBanner
