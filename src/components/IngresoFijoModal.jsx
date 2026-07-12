import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function IngresoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaCobro, setDiaCobro] = useState('1')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return
    setError('')
    try {
      await db.ingresos_fijos.add({ nombre, monto: Number(monto), dia_cobro: Number(diaCobro), activo: 1, createdAt: new Date().toISOString() })
      setNombre(''); setMonto(''); setDiaCobro('1')
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ingreso fijo">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Nombre (ej: Sueldo)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', '--tw-ring-color': 'var(--color-accent)' }} autoFocus />
        <input type="number" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Día de cobro</label>
          <input type="number" min="1" max="31" value={diaCobro} onChange={(e) => setDiaCobro(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm font-medium transition cursor-pointer"
          style={{ background: 'var(--color-accent)' }}>
          <Plus size={16} /> Guardar
        </button>
      </form>
    </Modal>
  )
}

export default IngresoFijoModal
