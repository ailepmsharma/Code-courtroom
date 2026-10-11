import { useEffect, useRef, useState } from 'react'

const storySteps = [
  { title: 'Evidence', copy: 'Every line enters the record. The details matter.' },
  { title: 'Arguments', copy: 'Both sides make their case, one finding at a time.' },
  { title: 'Ruling', copy: 'A verdict with reasons, fixes, and a score when available.' },
]

const AnimatedStat = ({ label, value }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const started = performance.now()
      const animate = (time) => {
        const progress = Math.min(1, (time - started) / 900)
        setCount(Math.round(value * (1 - (1 - progress) ** 3)))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
      observer.disconnect()
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div className="story-stat" ref={ref}>
      <strong>{count}</strong>
      <span>{label}</span>
    </div>
  )
}

const CourtroomStory = ({ stats, reduceEffects }) => {
  const storyRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (reduceEffects) return undefined
    let frame = 0
    const update = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const bounds = storyRef.current?.getBoundingClientRect()
        if (!bounds) return
        const range = Math.max(1, bounds.height - window.innerHeight)
        const progress = Math.min(0.999, Math.max(0, -bounds.top / range))
        setActiveStep(Math.floor(progress * storySteps.length))
      })
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [reduceEffects])

  return (
    <section className="courtroom-story" ref={storyRef} aria-label="How a trial works">
      <div className="courtroom-story-sticky">
        <div className="story-rail" aria-hidden="true">
          <span style={{ '--rail-fill': `${((activeStep + 1) / storySteps.length) * 100}%` }} />
        </div>
        <div className="story-content" aria-live="polite">
          <span className="story-number" aria-hidden="true">0{activeStep + 1}</span>
          <span className="story-kicker">THE PROCESS</span>
          <h2 key={storySteps[activeStep].title}>{storySteps[activeStep].title}</h2>
          <p>{storySteps[activeStep].copy}</p>
          <div className="story-step-count">{`0${activeStep + 1} / 0${storySteps.length}`}</div>
        </div>
        <div className="story-stats" aria-label="Courtroom activity">
          <span className="story-live"><i aria-hidden="true" /> LIVE</span>
          <AnimatedStat label="Trials run" value={stats.trials} />
          <AnimatedStat label="Bugs found" value={stats.bugs} />
          <AnimatedStat label="Average score" value={stats.average} />
        </div>
      </div>
      <div className="story-scroll-steps" aria-hidden="true">
        {storySteps.map((step) => <div key={step.title} />)}
      </div>
    </section>
  )
}

export default CourtroomStory
