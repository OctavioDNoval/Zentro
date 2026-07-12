import { useState } from 'react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function GastoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('suscripcion')
  const [totalCuotas, setTotalCuotas] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return

    const data = {
      nombre,
      monto: Number(monto),
      tipo,
      activo: true,
      createdAt: new Date(),
    }

    if (tipo === 'cuotas') {
      data.total_cuotas = Number(totalCuotas)
      data.cuotas_pagadas = 0
    }

    await db.gastos_fijos.add(data)

    setNombre('')
    setMonto('')
    setTipo('suscripcion')
    setTotalCuotas('')
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo gasto fijo">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre (ej: Netflix)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <input
          type="number"
          step="0.01"
          placeholder="Monto mensual"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="suscripcion">Suscripción</option>
          <option value="servicio">Servicio</option>
          <option value="cuotas">Cuotas</option>
        </select>
        {tipo === 'cuotas' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cantidad de cuotas</label>
            <input
              type="number"
              min="1"
              placeholder="Ej: 9"
              value={totalCuotas}
              onChange={(e) => setTotalCuotas(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        )}
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

export default GastoFijoModal
