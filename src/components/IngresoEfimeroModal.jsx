import { useState } from 'react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, {
    total_en_mano: (estado?.total_en_mano || 0) + delta,
    updatedAt: new Date(),
  })
}

function IngresoEfimeroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return

    await db.ingresos_efimeros.add({
      nombre,
      monto: Number(monto),
      fecha: new Date(),
      createdAt: new Date(),
    })

    await actualizarTotal(Number(monto))

    setNombre('')
    setMonto('')
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ingreso">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre (ej: Freelance)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
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

export default IngresoEfimeroModal
