import { useState, useEffect, useRef } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import { esMontoValido, parseMonto } from '../db/moneda.js'
import Modal from './Modal.jsx'

function IngresoFijoEditModal({ isOpen, onClose, ingreso, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaCobro, setDiaCobro] = useState('1')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (isOpen && ingreso) {
      setNombre(ingreso.nombre || '')
      setMonto(String(ingreso.monto || ''))
      setDiaCobro(String(ingreso.dia_cobro || '1'))
      setError('')
      setSaving(false)
      savingRef.current = false
    }
  }, [isOpen, ingreso])

  const mesActual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const aplicadoEsteMes = ingreso?.mes_aplicado === mesActual

  const handleUpdate = async () => {
    if (!ingreso || savingRef.current) return

    const nombreLimpiado = nombre.trim()
    if (!nombreLimpiado) {
      setError('Ingresá un nombre')
      return
    }
    if (!esMontoValido(monto)) {
      setError('Ingresá un monto válido mayor a 0')
      return
    }

    const dia = Number(diaCobro)
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setError('El día de cobro debe estar entre 1 y 31')
      return
    }

    setError('')
    try {
      const newMonto = parseMonto(monto)
      const oldMonto = Number.isFinite(Number(ingreso.monto)) ? Number(ingreso.monto) : 0
      setSaving(true)
      savingRef.current = true
      await db.ingresos_fijos.update(ingreso.id, { nombre: nombreLimpiado, monto: newMonto, dia_cobro: dia })
      const diff = newMonto - oldMonto
      if (aplicadoEsteMes && diff !== 0) await actualizarTotal(diff)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const handleDelete = async () => {
    if (!ingreso || savingRef.current) return
    setError('')
    try {
      const oldMonto = Number.isFinite(Number(ingreso.monto)) ? Number(ingreso.monto) : 0
      setSaving(true)
      savingRef.current = true
      await db.ingresos_fijos.delete(ingreso.id)
      if (aplicadoEsteMes && oldMonto > 0) await actualizarTotal(-oldMonto)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  if (!ingreso) return null

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar ingreso fijo">
      <div className="space-y-4">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Día de cobro</label>
          <input type="number" min="1" max="31" value={diaCobro} onChange={(e) => setDiaCobro(e.target.value)}
            disabled={saving}
            className={inputClass}
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate} disabled={saving}
            className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold cursor-pointer disabled:cursor-default">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button onClick={handleDelete} disabled={saving}
            className="flex items-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-default"
            style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)', border: '1px solid color-mix(in srgb, var(--color-negative) 20%, transparent)' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default IngresoFijoEditModal
