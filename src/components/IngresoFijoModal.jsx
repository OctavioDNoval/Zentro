import { useState, useRef } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import db from '../db/index.js'
import { esMontoValido, parseMonto } from '../db/moneda.js'
import Modal from './Modal.jsx'

function IngresoFijoModal({ isOpen, onClose, onSaved }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [diaCobro, setDiaCobro] = useState('1')
  const [sumarAhora, setSumarAhora] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const handleClose = () => {
    setNombre('')
    setMonto('')
    setDiaCobro('1')
    setSumarAhora(false)
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

    const dia = Number(diaCobro)
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setError('El día de cobro debe estar entre 1 y 31')
      return
    }

    setError('')
    try {
      const montoNum = parseMonto(monto)
      const hoy = new Date()
      const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
      setSaving(true)
      savingRef.current = true
      await db.transaction('rw', db.ingresos_fijos, db.movimientos_fijos_mensuales, db.estado_cuenta, async () => {
        const nuevoId = await db.ingresos_fijos.add({ nombre: nombreLimpiado, monto: montoNum, dia_cobro: dia, activo: 1, mes_aplicado: sumarAhora ? mesActual : null, createdAt: new Date().toISOString() })

        if (sumarAhora) {
          const estado = await db.estado_cuenta.get(1)
          const actual = Number.isFinite(estado?.total_en_mano) ? estado.total_en_mano : 0
          await db.estado_cuenta.update(1, {
            total_en_mano: actual + montoNum,
            updatedAt: new Date().toISOString(),
          })
          await db.movimientos_fijos_mensuales.add({
            mes: mesActual,
            tipo: 'ingreso',
            referenciaId: nuevoId,
            nombre: nombreLimpiado,
            monto: montoNum,
            moneda: 'ARS',
            monto_ars: montoNum,
            cotizacion: 1,
            origen: 'alta',
            createdAt: new Date().toISOString(),
          })
        }
      })
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo ingreso fijo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre (ej: Sueldo)" value={nombre} onChange={(e) => setNombre(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} autoFocus />
        <input type="number" inputMode="decimal" step="0.01" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)}
          disabled={saving}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>Día de cobro</label>
          <input type="number" min="1" max="31" value={diaCobro} onChange={(e) => setDiaCobro(e.target.value)}
            disabled={saving}
            className={inputClass}
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', opacity: saving ? 0.6 : 1 }} />
        </div>
        <label className="flex items-center gap-2.5 text-xs cursor-pointer py-1" style={{ color: 'var(--color-text-secondary)' }}>
          <input type="checkbox" checked={sumarAhora} onChange={(e) => setSumarAhora(e.target.checked)}
            disabled={saving}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]" />
          Sumar al disponible ahora — si no, se suma el 1 del próximo mes
        </label>
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

export default IngresoFijoModal
