import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function IngresoFijoEditModal({ isOpen, onClose, ingreso, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaCobro, setDiaCobro] = useState('1')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && ingreso) {
      setNombre(ingreso.nombre || '')
      setMonto(String(ingreso.monto || ''))
      setDiaCobro(String(ingreso.dia_cobro || '1'))
    }
  }, [isOpen, ingreso])

  const handleUpdate = async () => {
    if (!ingreso || !nombre || !monto) return
    setError('')
    try {
      await db.ingresos_fijos.update(ingreso.id, { nombre, monto: Number(monto), dia_cobro: Number(diaCobro) })
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar')
    }
  }

  const handleDelete = async () => {
    if (!ingreso) return
    setError('')
    try {
      await db.ingresos_fijos.delete(ingreso.id)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    }
  }

  if (!ingreso) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar ingreso fijo">
      <div className="space-y-3">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
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
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate}
            className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition cursor-pointer"
            style={{ background: 'var(--color-accent)' }}>
            Guardar cambios
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 rounded-lg py-2 text-sm font-medium transition cursor-pointer"
            style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default IngresoFijoEditModal
