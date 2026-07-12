import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, { total_en_mano: (estado?.total_en_mano || 0) + delta, updatedAt: new Date() })
}

function GastoEditModal({ isOpen, onClose, gasto, onSaved }) {
  const [categoriaId, setCategoriaId] = useState(1)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && gasto) {
      setCategoriaId(gasto.categoriaId || 1)
      db.categorias.toArray().then(setCategorias).catch(() => {})
    }
  }, [isOpen, gasto])

  const handleUpdate = async () => {
    if (!gasto) return
    setError('')
    try {
      await db.gastos_diarios.update(gasto.id, { categoriaId: Number(categoriaId) })
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
      await db.gastos_diarios.delete(gasto.id)
      await actualizarTotal(gasto.monto)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    }
  }

  if (!gasto) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar gasto">
      <div className="space-y-3">
        <div className="text-sm flex justify-between" style={{ color: 'var(--color-text)' }}>
          <span className="font-medium">{gasto.concepto}</span>
          <span style={{ color: 'var(--color-negative)' }}>${gasto.monto.toLocaleString('es-AR')}</span>
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(gasto.fecha).toLocaleDateString('es-AR')}
        </div>
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
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

export default GastoEditModal
