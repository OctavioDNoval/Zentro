import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, X, Download, Upload, Loader2, Trash2 } from 'lucide-react'
import { exportarDatos, importarDatos, borrarTodosLosDatos } from '../db/exportImport.js'
import { ejecutarCierreMensual } from '../db/ciclo-mensual.js'

function SettingsModal({ isOpen, onClose }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [importing, setImporting] = useState(false)
  const [resetting, setResetting] = useState(false)
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

  const reiniciarDatos = async () => {
    const confirmado = window.confirm('¿Reiniciar todos los datos? Se eliminarán movimientos, reportes, ahorros, categorías y el estado de cuenta. Esta acción no se puede deshacer.')
    if (!confirmado) return

    setResetting(true)
    try {
      await borrarTodosLosDatos()
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Error al reiniciar los datos: ' + err.message)
      setResetting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Configuración
          </h2>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
            style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center gap-3">
            {dark ? <Moon size={18} style={{ color: 'var(--color-accent)' }} /> : <Sun size={18} style={{ color: 'var(--color-accent)' }} />}
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Modo oscuro</span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer"
            style={{ background: dark ? 'var(--color-accent)' : 'var(--color-border)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300"
              style={{ transform: dark ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Datos</h3>
          <div className="flex flex-col gap-2">
            <button onClick={exportarDatos}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
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
                  try {
                    await ejecutarCierreMensual()
                  } catch (err) {
                    console.error('Error al reconstruir reportes:', err)
                  }
                  alert('Datos importados correctamente')
                  window.dispatchEvent(new CustomEvent('zentro:data-changed'))
                } catch (err) {
                  alert('Error al importar: ' + err.message)
                } finally {
                  setImporting(false)
                  e.target.value = ''
                }
              }} />

            <button onClick={() => fileRef.current?.click()} disabled={importing || resetting}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
              {importing ? <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                : <Upload size={18} style={{ color: 'var(--color-accent)' }} />}
              {importing ? 'Importando...' : 'Importar datos'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-negative)' }}>Zona de riesgo</h3>
          <button onClick={reiniciarDatos} disabled={resetting || importing}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)', border: '1px solid color-mix(in srgb, var(--color-negative) 20%, transparent)' }}>
            {resetting ? <Loader2 size={18} className="animate-spin" />
              : <Trash2 size={18} />}
            {resetting ? 'Reiniciando...' : 'Borrar todos los datos'}
          </button>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
            Elimina movimientos, reportes, ahorros, categorías y el estado de cuenta. Vuelve al estado inicial.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
