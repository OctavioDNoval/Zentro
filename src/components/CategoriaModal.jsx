import { useState } from 'react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function CategoriaModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    await db.categorias.add({ nombre: nombre.trim() })

    setNombre('')
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          Crear
        </button>
      </form>
    </Modal>
  )
}

export default CategoriaModal
