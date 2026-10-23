import { useState, useRef } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import { esMontoValido, parseMonto } from '../db/moneda.js'
import { useSugerenciasMonto } from '../hooks/useSugerenciasMonto.js'
import Modal from './Modal.jsx'
import SugerenciasMonto from './SugerenciasMonto.jsx'

function IngresoEfimeroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const sugerencias = useSugerenciasMonto({ tipo: 'ingreso-efimero', concepto: nombre, isOpen })

  const handleClose = () => {
    setNombre('')
    setMonto('')
    setError('')
    setSaving(false)
    savingRef.current = false
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (savingRef.current) return

    const nombreLimpiado = nombre.trim()
    if (!nombreLimpiado) {
      setError('Ingresá un nombre')
      return
    }
    if (!esMontoValido(monto)) {
      setError('Ingresá un monto válido mayor a 0')
      return
    }

    setError('')
    try {
      const montoNum = parseMonto(monto)
      const hoy = new Date(); const fechaStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      setSaving(true)
      savingRef.current = true
      await db.ingresos_efimeros.add({ nombre: nombreLimpiado, monto: montoNum, fecha: fechaStr, createdAt: new Date().toISOString() })
      await actualizarTotal(montoNum)
      await onSaved?.()
      handleClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo ingreso">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre (ej: Freelance)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <SugerenciasMonto sugerencias={sugerencias} onSelect={(montoSugerido) => !saving && setMonto(String(montoSugerido))} />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer disabled:cursor-default"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          <Plus size={16} /> {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </Modal>
  )
}

export default IngresoEfimeroModal
