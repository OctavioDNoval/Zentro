import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import Modal from './Modal.jsx'

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

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar gasto">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{gasto.concepto}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-negative)' }}>${gasto.monto.toLocaleString('es-AR')}</span>
        </div>
        <div className="text-xs px-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {new Date(gasto.fecha).toLocaleDateString('es-AR')}
        </div>
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
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

export default GastoEditModal
