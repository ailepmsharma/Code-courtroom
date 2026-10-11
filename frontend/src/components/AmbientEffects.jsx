import { useEffect, useRef } from 'react'

const AmbientEffects = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    let frame = 0
    let particles = []
    const motionReduced = () => document.documentElement.classList.contains('reduce-effects')
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * ratio)
      canvas.height = Math.floor(window.innerHeight * ratio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = motionReduced() ? 8 : window.matchMedia('(max-width: 768px)').matches ? 12 : 40
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0.6 + Math.random() * 1.5,
        speed: motionReduced() ? 0.06 + Math.random() * 0.12 : 0.12 + Math.random() * 0.32,
        drift: (Math.random() - 0.5) * (motionReduced() ? 0.08 : 0.18),
        opacity: motionReduced() ? 0.08 + Math.random() * 0.16 : 0.12 + Math.random() * 0.38,
      }))
    }
    const render = () => {
      if (document.hidden) {
        frame = 0
        return
      }
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--judge').trim()
      particles.forEach((particle) => {
        particle.y -= particle.speed
        particle.x += particle.drift
        if (particle.y < -4) {
          particle.y = window.innerHeight + 4
          particle.x = Math.random() * window.innerWidth
        }
        if (particle.x < -4) particle.x = window.innerWidth + 4
        if (particle.x > window.innerWidth + 4) particle.x = -4
        context.globalAlpha = particle.opacity
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })
      context.globalAlpha = 1
      frame = window.requestAnimationFrame(render)
    }
    const visibilityChange = () => {
      if (document.hidden) {
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
      } else if (!frame) {
        frame = window.requestAnimationFrame(render)
      }
    }
    const syncMotion = () => {
      resize()
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(render)
    }
    const observer = new MutationObserver(syncMotion)

    resize()
    frame = window.requestAnimationFrame(render)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibilityChange)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibilityChange)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="party-confetti" aria-hidden="true" />
  )
}

export default AmbientEffects
