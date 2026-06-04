import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 1000, enabled = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) return
    if (target === 0) { setValue(0); return }

    const start = Date.now()
    let raf: number

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, enabled])

  return value
}
