import { useCallback, useEffect, useRef, useState } from 'react'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'

const ScrambleText = ({ text, className, as: Element = 'span' }) => {
  const [display, setDisplay] = useState(text)
  const timerRef = useRef(null)
  const runScramble = useCallback(() => {
    window.clearInterval(timerRef.current)
    let frame = 0
    const frames = 9
    timerRef.current = window.setInterval(() => {
      frame += 1
      const resolved = Math.floor((frame / frames) * text.length)
      setDisplay([...text].map((letter, index) => (
        index < resolved || letter === ' ' ? letter : alphabet[Math.floor(Math.random() * alphabet.length)]
      )).join(''))
      if (frame >= frames) {
        window.clearInterval(timerRef.current)
        setDisplay(text)
      }
    }, 28)
  }, [text])

  useEffect(() => {
    runScramble()
    return () => window.clearInterval(timerRef.current)
  }, [runScramble])

  return <Element className={className} aria-hidden="true" onMouseEnter={runScramble} onFocus={runScramble}>{display}</Element>
}

export default ScrambleText
