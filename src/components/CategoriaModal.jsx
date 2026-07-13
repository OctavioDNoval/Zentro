import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function CategoriaModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setError('')
    try {
      await db.categorias.add({ nombre: nombre.trim() })
      setNombre('')
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al crear categoría')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} autoFocus />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer"
          style={{ background: 'var(--color-accent)' }}>
          <Plus size={16} /> Crear
        </button>
      </form>
    </Modal>
  )
}

export default CategoriaModal
