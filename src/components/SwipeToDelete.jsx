import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

const UMBRAL_EJE = 6 // px que hay que mover antes de decidir si el gesto es horizontal o vertical
const MAX = 100

// Deslizar a la izquierda para borrar.
// - Si el gesto es vertical, no hace nada y la página scrollea normal.
// - Si es horizontal, la fila se queda con el gesto: cancela el scroll nativo
//   (preventDefault en un listener no pasivo) y traba el carrusel de pestañas
//   mientras dura, para que nunca se cambie de pantalla al borrar. Esto funciona
//   también en Safari de iPhone, que no respeta del todo `touch-action`.
function SwipeToDelete({ children, onDelete, threshold = 80, rounded = true }) {
  const [offset, setOffset] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const raiz = useRef(null)
  const onDeleteRef = useRef(onDelete)

  useEffect(() => { onDeleteRef.current = onDelete })

  useEffect(() => {
    const el = raiz.current
    if (!el) return
    let x0 = 0, y0 = 0, eje = null, dx = 0, carrusel = null

    const liberarCarrusel = () => {
      if (carrusel) { carrusel.style.overflowX = ''; carrusel = null }
    }

    const onStart = (e) => {
      const t = e.touches[0]
      x0 = t.clientX; y0 = t.clientY; eje = null; dx = 0
    }

    const onMove = (e) => {
      const t = e.touches[0]
      const mx = x0 - t.clientX
      const my = t.clientY - y0
      if (!eje) {
        if (Math.abs(mx) < UMBRAL_EJE && Math.abs(my) < UMBRAL_EJE) {
          // Todavía no se sabe la dirección: si tira a horizontal, frenar ya el carrusel
          if (Math.abs(mx) > Math.abs(my) && e.cancelable) e.preventDefault()
          return
        }
        eje = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
        if (eje === 'x') {
          carrusel = el.closest('main')
          if (carrusel) carrusel.style.overflowX = 'hidden'
          setArrastrando(true)
        }
      }
      if (eje !== 'x') return
      if (e.cancelable) e.preventDefault()
      dx = Math.max(0, Math.min(mx, MAX))
      setOffset(dx)
    }

    const onEnd = async () => {
      liberarCarrusel()
      if (eje !== 'x') return
      eje = null
      setArrastrando(false)
      if (dx < threshold) { setOffset(0); return }
      setOffset(MAX)
      await new Promise((r) => setTimeout(r, 200))
      try { await onDeleteRef.current?.() } finally { setOffset(0) }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      liberarCarrusel()
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [threshold])

  return (
    <div ref={raiz} className={`relative overflow-hidden ${rounded ? 'rounded-2xl' : ''}`} style={{ touchAction: 'pan-y' }}>
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-center w-16 ${rounded ? 'rounded-r-2xl' : ''}`}
        style={{ background: 'var(--color-negative)', opacity: offset > 0 ? 1 : 0 }}
      >
        <Trash2 size={18} color="#fff" />
      </div>
      <div
        className="relative"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: arrastrando ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default SwipeToDelete
