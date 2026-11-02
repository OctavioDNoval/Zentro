import { useState, useRef } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { esMontoValido, parseMonto } from '../db/moneda.js'
import Modal from './Modal.jsx'
import MontoInput from './MontoInput.jsx'

function GastoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [tipo, setTipo] = useState('suscripcion')
  const [totalCuotas, setTotalCuotas] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const handleClose = () => {
    setNombre('')
    setMonto('')
    setMoneda('ARS')
    setTipo('suscripcion')
    setTotalCuotas('')
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

    let cuotas = null
    if (tipo === 'cuotas') {
      cuotas = Number(totalCuotas)
      if (!Number.isInteger(cuotas) || cuotas < 1) {
        setError('Ingresá una cantidad de cuotas válida')
        return
      }
    }

    setError('')
    try {
      const data = { nombre: nombreLimpiado, monto: parseMonto(monto), moneda, tipo, activo: 1, createdAt: new Date().toISOString() }
      if (tipo === 'cuotas') { data.total_cuotas = cuotas; data.cuotas_pagadas = 0 }
      setSaving(true)
      savingRef.current = true
      await db.gastos_fijos.add(data)
      await onSaved?.()
      handleClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo gasto fijo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre (ej: Netflix)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <MontoInput placeholder="Monto mensual" value={monto} onChange={setMonto}
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
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }}>
          <option value="suscripcion">Suscripción</option>
          <option value="servicio">Servicio</option>
          <option value="cuotas">Cuotas</option>
        </select>
        {tipo === 'cuotas' && (
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Cantidad de cuotas</label>
            <input type="number" min="1" placeholder="Ej: 9" value={totalCuotas} onChange={(e) => setTotalCuotas(e.target.value)}
              disabled={saving}
              className={inputClass}
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-2.5" style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-sm cursor-pointer disabled:cursor-default"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}>
          <Plus size={16} /> {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </Modal>
  )
}

export default GastoFijoModal
