import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'

function SwipeToDelete({ children, onDelete, threshold = 80 }) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    currentX.current = e.touches[0].clientX
    const diff = startX.current - currentX.current
    if (diff > 0) {
      setOffset(Math.min(diff, 100))
    }
  }

  const handleTouchEnd = () => {
    setSwiping(false)
    if (offset >= threshold) {
      setOffset(100)
      setTimeout(() => {
        onDelete?.()
        setOffset(0)
      }, 200)
    } else {
      setOffset(0)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center w-16 rounded-r-2xl"
        style={{ background: 'var(--color-negative)' }}
      >
        <Trash2 size={18} color="#fff" />
      </div>
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

export default SwipeToDelete
