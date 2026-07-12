import { useState, useEffect } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

async function actualizarTotal(delta) {
  const estado = await db.estado_cuenta.get(1)
  await db.estado_cuenta.update(1, { total_en_mano: (estado?.total_en_mano || 0) + delta, updatedAt: new Date().toISOString() })
}

function GastoDiarioModal({ isOpen, onClose, onSaved }) {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [categoriaId, setCategoriaId] = useState(1)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')

  useEffect(() => { if (isOpen) db.categorias.toArray().then(setCategorias).catch(() => {}) }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!concepto || !monto) return
    setError('')
    try {
      const hoy = new Date(); const fechaStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      await db.gastos_diarios.add({ concepto, monto: Number(monto), categoriaId: Number(categoriaId), fecha: fechaStr, createdAt: new Date().toISOString() })
      await actualizarTotal(-Number(monto))
      setConcepto(''); setMonto(''); setCategoriaId(1)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo gasto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="¿Qué compraste?" value={concepto} onChange={(e) => setConcepto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} autoFocus />
        <input type="number" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
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

export default GastoDiarioModal
