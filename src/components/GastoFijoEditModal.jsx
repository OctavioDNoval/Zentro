import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function GastoFijoEditModal({ isOpen, onClose, gasto, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [tipo, setTipo] = useState('suscripcion')
  const [totalCuotas, setTotalCuotas] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && gasto) {
      setNombre(gasto.nombre || '')
      setMonto(String(gasto.monto || ''))
      setMoneda(gasto.moneda || 'ARS')
      setTipo(gasto.tipo || 'suscripcion')
      setTotalCuotas(String(gasto.total_cuotas || ''))
    }
  }, [isOpen, gasto])

  const handleUpdate = async () => {
    if (!gasto || !nombre || !monto) return
    setError('')
    try {
      const data = { nombre, monto: Number(monto), moneda, tipo }
      if (tipo === 'cuotas') data.total_cuotas = Number(totalCuotas)
      await db.gastos_fijos.update(gasto.id, data)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar')
    }
  }

  const handleDelete = async () => {
    if (!gasto) return
    setError('')
    try {
      await db.gastos_fijos.delete(gasto.id)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    }
  }

  if (!gasto) return null

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar gasto fijo">
      <div className="space-y-4">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto mensual" value={monto} onChange={(e) => setMonto(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => setMoneda(m)}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer border"
              style={{
                background: moneda === m ? (m === 'ARS' ? 'var(--color-accent)' : 'var(--color-positive)') : 'var(--color-bg-secondary)',
                color: moneda === m ? '#fff' : 'var(--color-text-secondary)',
                borderColor: moneda === m ? 'transparent' : 'var(--color-border)',
              }}>
              {m === 'ARS' ? 'ARS $' : 'USD $'}
            </button>
          ))}
        </div>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
          <option value="suscripcion">Suscripción</option>
          <option value="servicio">Servicio</option>
          <option value="cuotas">Cuotas</option>
        </select>
        {tipo === 'cuotas' && (
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Cantidad de cuotas</label>
            <input type="number" min="1" placeholder="Ej: 9" value={totalCuotas} onChange={(e) => setTotalCuotas(e.target.value)}
              className={inputClass}
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate}
            className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
            Guardar cambios
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)', border: '1px solid color-mix(in srgb, var(--color-negative) 20%, transparent)' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GastoFijoEditModal
