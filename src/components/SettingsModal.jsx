import { useEffect, useState } from 'react'
import { Sun, Moon, X } from 'lucide-react'

function SettingsModal({ isOpen, onClose }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            Configuración
          </h2>
          <button onClick={onClose} className="cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--color-bg)' }}>
          <div className="flex items-center gap-3">
            {dark ? <Moon size={18} style={{ color: 'var(--color-accent)' }} /> : <Sun size={18} style={{ color: 'var(--color-text-secondary)' }} />}
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Modo oscuro</span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              dark ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                dark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
