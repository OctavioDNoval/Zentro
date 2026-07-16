import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, X, Download, Upload, Loader2 } from 'lucide-react'
import { exportarDatos, importarDatos } from '../db/exportImport.js'

function SettingsModal({ isOpen, onClose }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

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

        <div className="mt-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Datos</h3>
          <div className="flex flex-col gap-2">
            <button onClick={exportarDatos}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <Download size={18} style={{ color: 'var(--color-accent)' }} />
              Exportar datos
            </button>

            <input ref={fileRef} type="file" accept=".json" hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (!window.confirm('¿Estás seguro? Se reemplazarán todos los datos actuales con los del archivo.')) {
                  e.target.value = ''
                  return
                }
                setImporting(true)
                try {
                  await importarDatos(file)
                  alert('Datos importados correctamente')
                  window.dispatchEvent(new CustomEvent('zentro:data-changed'))
                } catch (err) {
                  alert('Error al importar: ' + err.message)
                } finally {
                  setImporting(false)
                  e.target.value = ''
                }
              }} />

            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              {importing ? <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                : <Upload size={18} style={{ color: 'var(--color-accent)' }} />}
              {importing ? 'Importando...' : 'Importar datos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
