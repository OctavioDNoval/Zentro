import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function GastoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('suscripcion')
  const [totalCuotas, setTotalCuotas] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return
    setError('')
    try {
      const data = { nombre, monto: Number(monto), tipo, activo: 1, createdAt: new Date().toISOString() }
      if (tipo === 'cuotas') { data.total_cuotas = Number(totalCuotas); data.cuotas_pagadas = 0 }
      await db.gastos_fijos.add(data)
      setNombre(''); setMonto(''); setTipo('suscripcion'); setTotalCuotas('')
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  const inputStyle = {
    borderColor: 'var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo gasto fijo">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Nombre (ej: Netflix)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle} autoFocus />
        <input type="number" step="0.01" placeholder="Monto mensual" value={monto} onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle}>
          <option value="suscripcion">Suscripción</option>
          <option value="servicio">Servicio</option>
          <option value="cuotas">Cuotas</option>
        </select>
        {tipo === 'cuotas' && (
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>Cantidad de cuotas</label>
            <input type="number" min="1" placeholder="Ej: 9" value={totalCuotas} onChange={(e) => setTotalCuotas(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle} />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm font-medium transition cursor-pointer"
          style={{ background: 'var(--color-accent)' }}>
          <Plus size={16} /> Guardar
        </button>
      </form>
    </Modal>
  )
}

export default GastoFijoModal
