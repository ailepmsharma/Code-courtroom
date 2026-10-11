import { useEffect, useRef } from 'react'

const randomBetween = (min, max) => min + Math.random() * (max - min)

const pointOnShape = (shape, width, height) => {
  const x = randomBetween(0, 1)
  const y = randomBetween(0, 1)
  const region = Math.random()
  if (shape === 'scales') {
    if (region < 0.2) return { x: width * 0.56, y: y * height * 0.72 + height * 0.12 }
    if (region < 0.4) return { x: width * (0.38 + x * 0.36), y: height * 0.28 }
    if (region < 0.65) return { x: width * 0.43, y: height * (0.33 + y * 0.23) }
    if (region < 0.9) return { x: width * 0.69, y: height * (0.33 + y * 0.23) }
    return { x: width * (0.35 + x * 0.42), y: height * 0.76 }
  }
  if (region < 0.55) return { x: width * (0.55 + x * 0.25), y: height * (0.2 + y * 0.16) }
  const t = randomBetween(0, 1)
  return { x: width * (0.61 - t * 0.2), y: height * (0.34 + t * 0.38) }
}

const HeroParticles = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return undefined

    const particles = []
    const pointer = { x: -1000, y: -1000, active: false }
    let width = 0
    let height = 0
    let frame = 0
    let start = performance.now()
    let intersecting = true
    let running = false
    let wasStriking = false
    let accent = ''
    let highlight = ''
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const reduceEffects = () => document.documentElement.classList.contains('reduce-effects')

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = mobileQuery.matches ? 800 : 3000
      particles.length = 0
      for (let index = 0; index < count; index += 1) {
        const target = pointOnShape('gavel', width, height)
        const scales = pointOnShape('scales', width, height)
        particles.push({
          x: randomBetween(0, width),
          y: randomBetween(0, height),
          targetX: target.x,
          targetY: target.y,
          scalesX: scales.x,
          scalesY: scales.y,
          seed: Math.random(),
          size: randomBetween(0.7, 2),
        })
      }
    }

    const updatePointer = (event) => {
      if (mobileQuery.matches) return
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }
    const clearPointer = () => { pointer.active = false }
    const schedule = () => {
      if (running) return
      running = true
      frame = window.requestAnimationFrame(animate)
    }
    const pause = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      if (intersecting && !document.hidden) schedule()
      else pause()
    })
    observer.observe(canvas)
    const readColors = () => {
      const styles = getComputedStyle(document.documentElement)
      accent = styles.getPropertyValue('--accent').trim() || accent
      highlight = styles.getPropertyValue('--text').trim() || highlight
    }
    const updateVisibility = () => {
      if (document.hidden) pause()
      else if (intersecting) schedule()
    }

    const animate = (time) => {
      running = false
      if (document.hidden || !intersecting) return
      context.clearRect(0, 0, width, height)
      const calm = reduceEffects()
      const cycle = calm ? 1.6 : ((time - start) % 9000) / 1000
      const scatter = !calm && ((cycle > 3.8 && cycle < 4.45) || (cycle > 6.55 && cycle < 7.05))
      const toScales = !calm && cycle >= 4.45 && cycle < 6.55
      const strike = !calm && cycle > 3.25 && cycle < 3.85
      const assemble = !calm && cycle < 1.6
      const progress = assemble ? Math.min(1, cycle / 1.6) : 1
      const ease = 1 - (1 - progress) ** 3
      if (strike && !wasStriking) {
        canvas.parentElement?.classList.add('particle-strike')
        window.setTimeout(() => canvas.parentElement?.classList.remove('particle-strike'), 260)
      }
      wasStriking = strike

      for (const particle of particles) {
        let tx = toScales ? particle.scalesX : particle.targetX
        let ty = toScales ? particle.scalesY : particle.targetY
        if (scatter) {
          tx += Math.sin(particle.seed * 82) * width * 0.2
          ty += Math.cos(particle.seed * 69) * height * 0.2
        }
        if (strike) ty += height * Math.sin(((cycle - 3.25) / 0.6) * Math.PI) * 0.15
        particle.currentX ??= particle.targetX
        particle.currentY ??= particle.targetY
        particle.currentX += (tx - particle.currentX) * (toScales || scatter ? 0.035 : 0.12)
        particle.currentY += (ty - particle.currentY) * (toScales || scatter ? 0.035 : 0.12)
        if (assemble) {
          particle.x += (particle.currentX - particle.x) * ease * 0.08
          particle.y += (particle.currentY - particle.y) * ease * 0.08
        } else {
          particle.x += (particle.currentX - particle.x) * 0.085
          particle.y += (particle.currentY - particle.y) * 0.085
        }
        if (pointer.active && !mobileQuery.matches && !calm) {
          const dx = particle.x - pointer.x
          const dy = particle.y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance > 0 && distance < 76) {
            const force = (76 - distance) / 76 * 2.1
            particle.x += dx / distance * force
            particle.y += dy / distance * force
          }
        }
        context.globalAlpha = 0.38 + particle.seed * 0.55
        context.fillStyle = particle.seed > 0.91 ? highlight : accent
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      }
      if (strike) {
        const strikeProgress = (cycle - 3.25) / 0.6
        const radius = Math.max(width, height) * strikeProgress * 0.7
        context.globalAlpha = Math.max(0, 0.75 - strikeProgress)
        context.strokeStyle = highlight
        context.lineWidth = 2
        context.beginPath()
        context.arc(width * 0.66, height * 0.3 + strikeProgress * height * 0.15, radius, 0, Math.PI * 2)
        context.stroke()
      }
      context.globalAlpha = 1
      schedule()
    }

    readColors()
    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', updateVisibility)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    canvas.addEventListener('pointerleave', clearPointer)
    mobileQuery.addEventListener('change', resize)
    schedule()

    return () => {
      pause()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', updateVisibility)
      window.removeEventListener('pointermove', updatePointer)
      canvas.removeEventListener('pointerleave', clearPointer)
      mobileQuery.removeEventListener('change', resize)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />
}

export default HeroParticles
