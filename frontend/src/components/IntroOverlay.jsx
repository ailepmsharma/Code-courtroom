import { useEffect, useState } from 'react'

const hasPlayed = () => {
  try {
    return sessionStorage.getItem('courtroom-intro-played') === 'true'
  } catch {
    return false
  }
}

const IntroOverlay = () => {
  const [visible, setVisible] = useState(() => (
    !hasPlayed()
  ))

  const finishIntro = () => {
    setVisible(false)
    try {
      sessionStorage.setItem('courtroom-intro-played', 'true')
    } catch {
      // The intro still dismisses when session storage is unavailable.
    }
  }

  useEffect(() => {
    if (!visible) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') finishIntro()
    }
    const endTimer = window.setTimeout(finishIntro, 2200)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(endTimer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="intro-overlay" role="dialog" aria-label="Court is coming to order" onClick={finishIntro}>
      <div className="intro-light-line" aria-hidden="true" />
      <div className="intro-doors" aria-hidden="true"><span /><span /></div>
      <span className="intro-shockwave" aria-hidden="true" />
      <div className="intro-content">
        <h1 aria-label="Put your code on trial"><span>PUT YOUR</span><span>CODE ON</span><span>TRIAL.</span></h1>
      </div>
    </div>
  )
}

export default IntroOverlay
