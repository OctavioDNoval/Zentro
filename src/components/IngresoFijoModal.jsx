import { useState } from 'react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function IngresoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaCobro, setDiaCobro] = useState('1')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return

    await db.ingresos_fijos.add({
      nombre,
      monto: Number(monto),
      dia_cobro: Number(diaCobro),
      activo: true,
      createdAt: new Date(),
    })

    setNombre('')
    setMonto('')
    setDiaCobro('1')
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ingreso fijo">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre (ej: Sueldo)"
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
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Día de cobro</label>
          <input
            type="number"
            min="1"
            max="31"
            value={diaCobro}
            onChange={(e) => setDiaCobro(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
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

export default IngresoFijoModal
