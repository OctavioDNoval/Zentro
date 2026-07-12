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

function GastoDiarioModal({ isOpen, onClose, onSaved }) {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [categoriaId, setCategoriaId] = useState(1)
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    if (isOpen) {
      db.categorias.toArray().then(setCategorias)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!concepto || !monto) return

    await db.gastos_diarios.add({
      concepto,
      monto: Number(monto),
      categoriaId: Number(categoriaId),
      fecha: new Date(),
      createdAt: new Date(),
    })

    await actualizarTotal(-Number(monto))

    setConcepto('')
    setMonto('')
    setCategoriaId(1)
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo gasto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="¿Qué compraste?"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <input
          type="number"
          step="0.01"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
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
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          Guardar
        </button>
      </form>
    </Modal>
  )
}

export default GastoDiarioModal
