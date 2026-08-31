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

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} autoFocus />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          <Plus size={16} /> Crear
        </button>
      </form>
    </Modal>
  )
}

export default CategoriaModal
