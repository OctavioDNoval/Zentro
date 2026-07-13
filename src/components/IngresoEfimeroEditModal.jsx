import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, { total_en_mano: (estado?.total_en_mano || 0) + delta, updatedAt: new Date().toISOString() })
}

function IngresoEfimeroEditModal({ isOpen, onClose, ingreso, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && ingreso) {
      setNombre(ingreso.nombre || '')
      setMonto(String(ingreso.monto || ''))
      setFecha(ingreso.fecha || '')
    }
  }, [isOpen, ingreso])

  const handleUpdate = async () => {
    if (!ingreso || !nombre || !monto || !fecha) return
    setError('')
    try {
      const oldMonto = ingreso.monto || 0
      await db.ingresos_efimeros.update(ingreso.id, { nombre, monto: Number(monto), fecha })
      const diff = Number(monto) - oldMonto
      if (diff !== 0) await actualizarTotal(diff)
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
      await db.ingresos_efimeros.delete(ingreso.id)
      await actualizarTotal(-(ingreso.monto || 0))
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    }
  }

  if (!ingreso) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar ingreso">
      <div className="space-y-3">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <input type="number" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate}
            className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-accent)' }}>
            Guardar cambios
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default IngresoEfimeroEditModal
