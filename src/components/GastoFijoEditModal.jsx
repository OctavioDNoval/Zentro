import { useState, useEffect, useRef } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { esMontoValido, parseMonto, formatearMontoInput } from '../db/moneda.js'
import Modal from './Modal.jsx'
import MontoInput from './MontoInput.jsx'

function GastoFijoEditModal({ isOpen, onClose, gasto, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [tipo, setTipo] = useState('suscripcion')
  const [totalCuotas, setTotalCuotas] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (isOpen && gasto) {
      setNombre(gasto.nombre || '')
      setMonto(formatearMontoInput(gasto.monto ?? ''))
      setMoneda(gasto.moneda || 'ARS')
      setTipo(gasto.tipo || 'suscripcion')
      setTotalCuotas(String(gasto.total_cuotas || ''))
      setError('')
      setSaving(false)
      savingRef.current = false
    }
  }, [isOpen, gasto])

  const handleUpdate = async () => {
    if (!gasto || savingRef.current) return

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
      const pagadas = Number(gasto.cuotas_pagadas) || 0
      if (!Number.isInteger(cuotas) || cuotas < 1) {
        setError('Ingresá una cantidad de cuotas válida')
        return
      }
      if (cuotas < pagadas) {
        setError('Las cuotas no pueden ser menores a las ya pagadas')
        return
      }
    }

    setError('')
    try {
      const data = { nombre: nombreLimpiado, monto: parseMonto(monto), moneda, tipo }
      if (tipo === 'cuotas') {
        data.total_cuotas = cuotas
        data.cuotas_pagadas = Number(gasto.cuotas_pagadas) || 0
      } else {
        data.total_cuotas = null
        data.cuotas_pagadas = 0
      }
      setSaving(true)
      savingRef.current = true
      await db.gastos_fijos.update(gasto.id, data)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const handleDelete = async () => {
    if (!gasto || savingRef.current) return
    setError('')
    try {
      setSaving(true)
      savingRef.current = true
      await db.gastos_fijos.delete(gasto.id)
      await onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al eliminar')
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  if (!gasto) return null

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar gasto fijo">
      <div className="space-y-4">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
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
        <div className="flex gap-2 pt-2">
          <button onClick={handleUpdate} disabled={saving}
            className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold cursor-pointer disabled:cursor-default">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button onClick={handleDelete} disabled={saving}
            className="flex items-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-default"
            style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)', border: '1px solid color-mix(in srgb, var(--color-negative) 20%, transparent)' }}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GastoFijoEditModal
