import { useEffect, useRef, useState } from 'react'
import { buggyCodeSample, cleanCodeSample } from '../data/sampleCode.js'
import HeroParticles from './HeroParticles.jsx'

const evidenceLines = `${buggyCodeSample}\n\n${cleanCodeSample}`.split('\n')
const wallLines = Array.from({ length: 4 }, (_, repeat) => evidenceLines.map((text, index) => ({
  key: `${repeat}-${index}`,
  text: text || ' ',
  line: index,
}))).flat()

const EvidenceWall = ({ className, flaggedLine }) => (
  <pre className={className} aria-hidden="true">
    {wallLines.map((line) => (
      <span className={`wall-line ${line.line === flaggedLine ? 'is-flagged' : ''}`} key={line.key}>
        {line.text}{line.line === flaggedLine && <i>BUG</i>}
      </span>
    ))}
  </pre>
)

const TitleLine = ({ text, className = '' }) => (
  <span className={`hero-title-line ${className}`} aria-hidden="true">
    {[...text].map((letter, index) => (
      <span key={`${letter}-${index}`} style={{ '--letter-order': index }}>{letter === ' ' ? '\u00a0' : letter}</span>
    ))}
  </span>
)

const HeroPanel = ({ onLoadSample }) => {
  const spotlightRef = useRef(null)
  const animationRef = useRef(0)
  const pointerRef = useRef({ x: 0.5, y: 0.45 })
  const currentRef = useRef({ x: 0.5, y: 0.45 })
  const pointerFineRef = useRef(false)
  const [flaggedLine, setFlaggedLine] = useState(12)

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    pointerFineRef.current = pointerQuery.matches
    const updatePointerType = (event) => { pointerFineRef.current = event.matches }
    pointerQuery.addEventListener('change', updatePointerType)

    const animateSpotlight = (time) => {
      const target = pointerRef.current
      if (!pointerFineRef.current) {
        target.x = 0.5 + Math.sin(time / 3700) * 0.13
        target.y = 0.46 + Math.sin(time / 2300) * 0.1
      }
      currentRef.current.x += (target.x - currentRef.current.x) * 0.12
      currentRef.current.y += (target.y - currentRef.current.y) * 0.12
      spotlightRef.current?.style.setProperty('--spot-x', `${currentRef.current.x * 100}%`)
      spotlightRef.current?.style.setProperty('--spot-y', `${currentRef.current.y * 100}%`)
      animationRef.current = window.requestAnimationFrame(animateSpotlight)
    }
    animationRef.current = window.requestAnimationFrame(animateSpotlight)
    const flagTimer = window.setInterval(() => {
      setFlaggedLine((line) => (line + 7) % evidenceLines.length)
    }, 3400)
    return () => {
      window.cancelAnimationFrame(animationRef.current)
      window.clearInterval(flagTimer)
      pointerQuery.removeEventListener('change', updatePointerType)
    }
  }, [])

  const handlePointerMove = (event) => {
    if (!pointerFineRef.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerRef.current = {
      x: 0.45 + Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)) * 0.526,
      y: 0.45 + Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) * 0.526,
    }
    const action = event.currentTarget.querySelector('.hero-primary-action')
    if (action) {
      const actionBounds = action.getBoundingClientRect()
      const dx = (event.clientX - (actionBounds.left + actionBounds.width / 2)) / actionBounds.width
      const dy = (event.clientY - (actionBounds.top + actionBounds.height / 2)) / actionBounds.height
      action.style.setProperty('--magnet-x', `${Math.max(-4, Math.min(4, dx * 4))}px`)
      action.style.setProperty('--magnet-y', `${Math.max(-4, Math.min(4, dy * 4))}px`)
    }
  }

  const resetMagnet = (event) => {
    event.currentTarget.querySelector('.hero-primary-action')?.style.removeProperty('--magnet-x')
    event.currentTarget.querySelector('.hero-primary-action')?.style.removeProperty('--magnet-y')
  }

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(12)
  }

  const trySample = () => {
    onLoadSample('buggy')
    window.setTimeout(() => document.getElementById('code-input')?.focus({ preventScroll: true }), 0)
  }

  return (
    <header className="hero-panel" onPointerMove={handlePointerMove} onPointerLeave={resetMagnet}>
      <div className="evidence-wall" aria-hidden="true">
        <EvidenceWall className="evidence-wall-base" flaggedLine={flaggedLine} />
        <div className="evidence-wall-spotlight" ref={spotlightRef}>
          <EvidenceWall className="evidence-wall-lit" flaggedLine={flaggedLine} />
        </div>
      </div>
      <div className="hero-aurora hero-aurora-one" aria-hidden="true" />
      <div className="hero-aurora hero-aurora-two" aria-hidden="true" />
      <div className="hero-aurora hero-aurora-three" aria-hidden="true" />
      <HeroParticles />
      <div className="hero-copy">
        <h1 id="page-title" aria-label="Put your code on trial">
          <TitleLine text="PUT YOUR" />
          <TitleLine text="CODE ON" />
          <TitleLine text="TRIAL." className="hero-title-final" />
        </h1>
        <p className="hero-text">A close reading of your code, argued from every side.</p>
        <div className="hero-actions">
          <a href="#code-input" className="hero-primary-action" onClick={triggerHaptic}>
            <span>Begin trial</span><span className="hero-action-arrow" aria-hidden="true">↗</span>
          </a>
          <button type="button" className="hero-sample-action" onClick={trySample}>Try a sample</button>
        </div>
      </div>
      <a className="hero-scroll-cue" href="#code-input" aria-label="Scroll to the code editor" />
      <div className="intro-light-line" aria-hidden="true" />
    </header>
  )
}

export default HeroPanel
