import { useState, useEffect, useRef } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import { esMontoValido, parseMonto, formatearMontoInput } from '../db/moneda.js'
import Modal from './Modal.jsx'
import MontoInput from './MontoInput.jsx'

function AhorroEditModal({ isOpen, onClose, ahorro, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState('ARS')
  const [descontarDelTotal, setDescontarDelTotal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (isOpen && ahorro) {
      setNombre(ahorro.nombre || '')
      setMonto(formatearMontoInput(ahorro.monto ?? ''))
      setMoneda(ahorro.moneda || 'ARS')
      setDescontarDelTotal(ahorro.descontadoDeTotal || false)
      setError('')
      setSaving(false)
      savingRef.current = false
    }
  }, [isOpen, ahorro])

  const handleUpdate = async () => {
    if (!ahorro || savingRef.current) return

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
      const oldMonto = Number.isFinite(Number(ahorro.monto)) ? Number(ahorro.monto) : 0
      const oldDescontado = ahorro.descontadoDeTotal || false
      const newMonto = parseMonto(monto)
      const esARS = moneda === 'ARS'
      const newDescuenta = esARS && descontarDelTotal

      setSaving(true)
      savingRef.current = true
      await db.ahorros.update(ahorro.id, { nombre: nombreLimpiado, monto: newMonto, moneda, descontadoDeTotal: newDescuenta, updatedAt: new Date().toISOString() })

      if (oldDescontado && newDescuenta) {
        const diff = newMonto - oldMonto
        if (diff !== 0) await actualizarTotal(-diff)
      } else if (oldDescontado && !newDescuenta) {
        await actualizarTotal(oldMonto)
      } else if (!oldDescontado && newDescuenta) {
        await actualizarTotal(-newMonto)
      }

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
    if (!ahorro || savingRef.current) return
    setError('')
    try {
      const oldMonto = Number.isFinite(Number(ahorro.monto)) ? Number(ahorro.monto) : 0
      setSaving(true)
      savingRef.current = true
      await db.ahorros.delete(ahorro.id)
      if (ahorro.descontadoDeTotal && oldMonto > 0) await actualizarTotal(oldMonto)
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

  if (!ahorro) return null

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar ahorro">
      <div className="space-y-4">
        <input type="text" placeholder="¿Para qué es?" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <MontoInput placeholder="Monto" value={monto} onChange={setMonto}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div className="flex gap-2">
          {['ARS', 'USD'].map((m) => (
            <button key={m} type="button" onClick={() => {
              if (saving) return
              setMoneda(m)
              if (m !== 'ARS') setDescontarDelTotal(false)
            }} disabled={saving}
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

export default AhorroEditModal
