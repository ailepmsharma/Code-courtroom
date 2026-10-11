import { useCallback, useState } from 'react'

const EFFECTS_KEY = 'code-courtroom-reduce-motion-v3'

const readPreference = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const savePreference = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // The current session still works when browser storage is unavailable.
  }
}

export const useTheme = () => {
  const [reduceEffects, setReduceEffects] = useState(() => (
    readPreference(EFFECTS_KEY) === 'true'
  ))

  const toggleReduceEffects = useCallback(() => {
    setReduceEffects((current) => {
      const next = !current
      savePreference(EFFECTS_KEY, String(next))
      document.documentElement.classList.toggle('reduce-effects', next)
      return next
    })
  }, [])

  return { reduceEffects, toggleReduceEffects }
}
