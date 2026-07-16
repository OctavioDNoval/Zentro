import { useState, useEffect } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function AhorroEditModal({ isOpen, onClose, ahorro, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && ahorro) {
      setNombre(ahorro.nombre || '')
      setMonto(String(ahorro.monto || ''))
      setMoneda(ahorro.moneda || 'ARS')
    }
  }, [isOpen, ahorro])

  const handleUpdate = async () => {
    if (!ahorro || !nombre || !monto) return
    setError('')
    try {
      await db.ahorros.update(ahorro.id, { nombre, monto: Number(monto), moneda, updatedAt: new Date().toISOString() })
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar')
    }
  }

  const handleDelete = async () => {
    if (!ahorro) return
    setError('')
    try {
      await db.ahorros.delete(ahorro.id)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    }
  }

  if (!ahorro) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar ahorro">
      <div className="space-y-3">
        <input type="text" placeholder="¿Para qué es?" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => setMoneda(m)}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer border"
              style={{
                background: moneda === m ? (m === 'ARS' ? 'var(--color-accent)' : '#16a34a') : 'var(--color-bg)',
                color: moneda === m ? '#fff' : 'var(--color-text)',
                borderColor: moneda === m ? 'transparent' : 'var(--color-border)',
              }}>
              {m === 'ARS' ? 'ARS $' : 'USD $'}
            </button>
          ))}
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate}
            className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-accent)' }}>
            Guardar cambios
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AhorroEditModal
