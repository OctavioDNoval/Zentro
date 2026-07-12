import { useState, useEffect } from 'react'

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const from = 0
    const diff = value - from
    const start = performance.now()

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + diff * eased))
      if (progress < 1) requestAnimationFrame(step)
    }

    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return formatearMoneda(display)
}

export default AnimatedNumber
