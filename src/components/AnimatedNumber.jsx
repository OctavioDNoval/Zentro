import { useState, useEffect } from 'react'

function defaultFormat(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

function AnimatedNumber({ value, duration = 600, format }) {
  const [display, setDisplay] = useState(0)
  const formatter = format || defaultFormat

  useEffect(() => {
    const from = 0
    const diff = value - from
    const start = performance.now()

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + diff * eased)
      if (progress < 1) requestAnimationFrame(step)
    }

    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return formatter(display)
}

export default AnimatedNumber
