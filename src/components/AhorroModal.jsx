import { useState, useEffect, useRef } from 'react'
import { Plus, Check, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import Modal from './Modal.jsx'

function AhorroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setSaving(false)
      savingRef.current = false
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto || savingRef.current) return
    setError('')
    try {
      await db.ahorros.add({ nombre, monto: Number(monto), moneda, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      setSaving(true)
      savingRef.current = true
      setTimeout(() => {
        onSaved?.()
        onClose()
        setNombre('')
        setMonto('')
        setMoneda('ARS')
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
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ahorro">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="¿Para qué es?" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: saving ? 'var(--color-bg-secondary)' : 'var(--color-bg)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: saving ? 'var(--color-bg-secondary)' : 'var(--color-bg)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => !saving && setMoneda(m)}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer border"
              style={{
                background: moneda === m ? (m === 'ARS' ? 'var(--color-accent)' : '#16a34a') : 'var(--color-bg)',
                color: moneda === m ? '#fff' : 'var(--color-text)',
                borderColor: moneda === m ? 'transparent' : 'var(--color-border)',
                opacity: saving ? 0.6 : 1,
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
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:cursor-default"
          style={{ background: saving ? '#16a34a' : 'var(--color-accent)' }}>
          {saving ? <><Check size={16} /> ¡Guardado!</> : <><Plus size={16} /> Guardar</>}
        </button>
      </form>
    </Modal>
  )
}

export default AhorroModal
