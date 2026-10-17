import { useState, useEffect, useRef } from 'react'
import { Plus, Check, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import Modal from './Modal.jsx'

function AhorroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [descontarDelTotal, setDescontarDelTotal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setSaving(false)
      savingRef.current = false
      setDescontarDelTotal(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !monto || savingRef.current) return
    setError('')
    try {
      const descuenta = moneda === 'ARS' && descontarDelTotal
      await db.ahorros.add({ nombre, monto: Number(monto), moneda, descontadoDeTotal: descuenta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      if (descuenta) await actualizarTotal(-Number(monto))
      setSaving(true)
      savingRef.current = true
      setTimeout(() => {
        onSaved?.()
        onClose()
        setNombre('')
        setMonto('')
        setMoneda('ARS')
        setDescontarDelTotal(false)
        setSaving(false)
        savingRef.current = false
      }, 800)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo ahorro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="¿Para qué es?" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => !saving && setMoneda(m)}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer border"
              style={{
                background: moneda === m ? (m === 'ARS' ? 'var(--color-accent)' : 'var(--color-positive)') : 'var(--color-bg-secondary)',
                color: moneda === m ? '#fff' : 'var(--color-text-secondary)',
                borderColor: moneda === m ? 'transparent' : 'var(--color-border)',
                opacity: saving ? 0.6 : 1,
              }}>
              {m === 'ARS' ? 'ARS $' : 'USD $'}
            </button>
          ))}
        </div>
        {moneda === 'ARS' && (
          <label className="flex items-center gap-2.5 text-xs cursor-pointer py-1" style={{ color: 'var(--color-text-secondary)' }}>
            <input type="checkbox" checked={descontarDelTotal} onChange={(e) => setDescontarDelTotal(e.target.checked)}
              disabled={saving}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]" />
            Descontar del total en mano
          </label>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer disabled:cursor-default"
          style={{ background: saving ? 'var(--color-positive)' : 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          {saving ? <><Check size={16} /> ¡Guardado!</> : <><Plus size={16} /> Guardar</>}
        </button>
      </form>
    </Modal>
  )
}

export default AhorroModal
