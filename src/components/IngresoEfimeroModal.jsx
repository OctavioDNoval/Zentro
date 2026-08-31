import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, { total_en_mano: (estado?.total_en_mano || 0) + delta, updatedAt: new Date().toISOString() })
}

function IngresoEfimeroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto) return
    setError('')
    try {
      const hoy = new Date(); const fechaStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      await db.ingresos_efimeros.add({ nombre, monto: Number(monto), fecha: fechaStr, createdAt: new Date().toISOString() })
      await actualizarTotal(Number(monto))
      setNombre(''); setMonto('')
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ingreso">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre (ej: Freelance)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          <Plus size={16} /> Guardar
        </button>
      </form>
    </Modal>
  )
}

export default IngresoEfimeroModal
