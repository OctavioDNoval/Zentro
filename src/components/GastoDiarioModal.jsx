import { useState, useEffect, useRef } from 'react'
import { Plus, Check, AlertCircle } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      db.categorias.toArray().then(setCategorias).catch(() => {})
    } else {
      setSaving(false)
      savingRef.current = false
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!concepto || !monto || savingRef.current) return
    setError('')
    try {
      const hoy = new Date(); const fechaStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      await db.gastos_diarios.add({ concepto, monto: Number(monto), categoriaId: Number(categoriaId), fecha: fechaStr, createdAt: new Date().toISOString() })
      await actualizarTotal(-Number(monto))
      setSaving(true)
      savingRef.current = true
      setTimeout(() => {
        onSaved?.()
        onClose()
        setConcepto('')
        setMonto('')
        setCategoriaId(1)
        setSaving(false)
        savingRef.current = false
      }, 800)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition-all duration-150'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo gasto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="¿Qué compraste?" value={concepto} onChange={(e) => setConcepto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: saving ? 'var(--color-bg-secondary)' : 'var(--color-bg)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: saving ? 'var(--color-bg-secondary)' : 'var(--color-bg)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: saving ? 'var(--color-bg-secondary)' : 'var(--color-bg)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }}>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-negative)', color: '#fff' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:cursor-default"
          style={{ background: saving ? '#16a34a' : 'var(--color-accent)' }}>
          {saving ? <><Check size={16} /> ¡Guardado!</> : <><Plus size={16} /> Guardar</>}
        </button>
      </form>
    </Modal>
  )
}

export default GastoDiarioModal
