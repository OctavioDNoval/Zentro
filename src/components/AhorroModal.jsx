import { useState, useEffect, useRef } from 'react'
import { Plus, Check, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import { esMontoValido, parseMonto } from '../db/moneda.js'
import Modal from './Modal.jsx'
import MontoInput from './MontoInput.jsx'

function AhorroModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [descontarDelTotal, setDescontarDelTotal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setNombre('')
    setMonto('')
    setMoneda('ARS')
    setDescontarDelTotal(false)
    setError('')
    setSaving(false)
    savingRef.current = false
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (savingRef.current) return

    const nombreLimpiado = nombre.trim()
    if (!nombreLimpiado) {
      setError('Ingresá un nombre')
      return
    }
    if (!esMontoValido(monto)) {
      setError('Ingresá un monto válido mayor a 0')
      return
    }

    setError('')
    try {
      const montoNum = parseMonto(monto)
      const descuenta = moneda === 'ARS' && descontarDelTotal
      setSaving(true)
      savingRef.current = true
      await db.ahorros.add({ nombre: nombreLimpiado, monto: montoNum, moneda, descontadoDeTotal: descuenta, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      if (descuenta) await actualizarTotal(-montoNum)
      onSaved?.()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        handleClose()
      }, 800)
    } catch (err) {
      console.error(err)
      setSaving(false)
      savingRef.current = false
      setError(err.message || 'Error al guardar')
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo ahorro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="¿Para qué es?" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <MontoInput placeholder="Monto" value={monto} onChange={setMonto}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => !saving && setMoneda(m)} disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer border disabled:cursor-default"
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
