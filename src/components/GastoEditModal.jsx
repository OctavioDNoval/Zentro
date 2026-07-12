import { useState, useEffect } from 'react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, {
    total_en_mano: (estado?.total_en_mano || 0) + delta,
    updatedAt: new Date(),
  })
}

function GastoEditModal({ isOpen, onClose, gasto, onSaved }) {
  const [categoriaId, setCategoriaId] = useState(1)
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    if (isOpen && gasto) {
      setCategoriaId(gasto.categoriaId || 1)
      db.categorias.toArray().then(setCategorias)
    }
  }, [isOpen, gasto])

  const handleUpdate = async () => {
    if (!gasto) return
    await db.gastos_diarios.update(gasto.id, { categoriaId: Number(categoriaId) })
    onSaved?.()
    onClose()
  }

  const handleDelete = async () => {
    if (!gasto) return
    await db.gastos_diarios.delete(gasto.id)

    await actualizarTotal(gasto.monto)

    onSaved?.()
    onClose()
  }

  if (!gasto) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar gasto">
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{gasto.concepto}</span> — ${gasto.monto.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(gasto.fecha).toLocaleDateString('es-AR')}
        </div>

        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            Guardar cambios
          </button>
          <button
            onClick={handleDelete}
            className="px-4 bg-red-50 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GastoEditModal
