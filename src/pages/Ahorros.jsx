import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, RefreshCw, Pencil, Wallet, TrendingUp } from 'lucide-react'
import db from '../db/index.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import AhorroModal from '../components/AhorroModal.jsx'
import AhorroEditModal from '../components/AhorroEditModal.jsx'

const DOLAR_API = 'https://dolarapi.com/v1/dolares'
const CASAS = ['blue', 'oficial', 'mep', 'ccl']
const NOMBRES_CASA = { blue: 'Blue', oficial: 'Oficial', mep: 'MEP', ccl: 'CCL' }
const COLORES_CASA = {
  blue: { bg: '#dbeafe', text: '#1d40a0', border: '#bfdbfe' },
  oficial: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  mep: { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  ccl: { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
}

function formatARS(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUSD(n) {
  return 'USD ' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatearUltimaActualizacion(fechaStr) {
  if (!fechaStr) return null
  const ahora = Date.now()
  const diff = ahora - new Date(fechaStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace segundos'
  if (mins < 60) return `hace ${mins} min`
  const hs = Math.floor(mins / 60)
  return `hace ${hs}h ${mins % 60}m`
}

async function fetchCotizaciones() {
  try {
    const res = await fetch(DOLAR_API)
    if (!res.ok) throw new Error('Error HTTP: ' + res.status)
    const data = await res.json()
    const cotizaciones = data.filter(d => CASAS.includes(d.casa))
    await db.cotizaciones.bulkPut(cotizaciones.map(c => ({
      casa: c.casa,
      compra: c.compra,
      venta: c.venta,
      nombre: c.nombre,
      fechaActualizacion: c.fechaActualizacion,
    })))
    return cotizaciones
  } catch (err) {
    console.error('Error fetching cotizaciones:', err)
    const cached = await db.cotizaciones.toArray()
    return cached.length > 0 ? cached : null
  }
}

function Ahorros() {
  const [ahorros, setAhorros] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAhorro, setEditAhorro] = useState(null)
  const intervalRef = useRef(null)

  const blue = cotizaciones.find(c => c.casa === 'blue')

  const cargarAhorros = useCallback(async () => {
    try {
      const data = await db.ahorros.reverse().toArray()
      setAhorros(data)
    } catch (err) {
      console.error('Error cargando ahorros:', err)
    }
  }, [])

  const cargarCotizaciones = useCallback(async () => {
    setFetching(true)
    const data = await fetchCotizaciones()
    if (data) {
      setCotizaciones(data)
      const fechas = data.map(c => c.fechaActualizacion).filter(Boolean).sort()
      setLastUpdated(fechas[fechas.length - 1] || null)
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    cargarAhorros()
    cargarCotizaciones()
    intervalRef.current = setInterval(cargarCotizaciones, 300000)
    return () => clearInterval(intervalRef.current)
  }, [cargarAhorros, cargarCotizaciones])

  const totalARS = ahorros
    .filter(a => a.moneda === 'ARS')
    .reduce((s, a) => s + a.monto, 0)
  const totalUSD = ahorros
    .filter(a => a.moneda === 'USD')
    .reduce((s, a) => s + a.monto, 0)

  const totalEnARS = blue ? totalARS + totalUSD * blue.venta : totalARS
  const totalEnUSD = blue ? totalUSD + totalARS / blue.venta : totalUSD

  return (
    <div className="space-y-5 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold tracking-tight text-center" style={{ color: 'var(--color-accent)' }}>Ahorros</h1>

      <section className="rounded-xl border p-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Cotizaciones USD</span>
          <button onClick={cargarCotizaciones} disabled={fetching}
            className="flex items-center gap-1 text-xs font-medium transition-all duration-150 active:scale-90 cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--color-accent)' }}>
            <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CASAS.map((casa) => {
            const c = cotizaciones.find(c => c.casa === casa)
            const colores = COLORES_CASA[casa]
            return (
              <div key={casa} className="rounded-lg p-2 text-center border" style={{ background: colores.bg, borderColor: colores.border }}>
                <p className="text-[10px] font-semibold" style={{ color: colores.text }}>{NOMBRES_CASA[casa]}</p>
                <p className="text-xs font-bold" style={{ color: colores.text }}>
                  {c ? '$' + Number(c.venta).toLocaleString('es-AR') : '-'}
                </p>
              </div>
            )
          })}
        </div>
        {lastUpdated && (
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Actualizado {formatearUltimaActualizacion(lastUpdated)}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total en ARS', value: totalEnARS, format: formatARS, color: 'var(--color-accent)', icon: Wallet },
          { label: 'Total en USD', value: totalEnUSD, format: formatUSD, color: '#16a34a', icon: TrendingUp },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl p-3 border animate-fade-in-up animate-scale-in transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</span>
                <Icon size={14} style={{ color: card.color }} />
              </div>
              <p className="text-sm font-bold" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} format={card.format} />
              </p>
              {blue && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>cotización Blue ${Number(blue.venta).toLocaleString('es-AR')}</p>
              )}
            </div>
          )
        })}
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Tus ahorros</h3>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95"
            style={{ color: 'var(--color-accent)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {ahorros.length === 0 ? (
          <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sin ahorros todavía</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Agregá tu primer ahorro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ahorros.map((a, i) => (
              <div key={a.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center animate-fade-in-up cursor-pointer transition-all duration-150 hover:opacity-80 active:scale-[0.98]"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditAhorro(a)}>
                <div className="flex items-center gap-2">
                  <Pencil size={12} className="shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{a.nombre}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: a.moneda === 'ARS' ? '#fef3c7' : '#dbeafe', color: a.moneda === 'ARS' ? '#b45309' : '#1d4ed8' }}>
                      {a.moneda}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: a.moneda === 'ARS' ? 'var(--color-accent)' : '#16a34a' }}>
                  {a.moneda === 'ARS' ? formatARS(a.monto) : formatUSD(a.monto)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <AhorroModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={cargarAhorros} />
      <AhorroEditModal isOpen={!!editAhorro} onClose={() => setEditAhorro(null)} ahorro={editAhorro} onSaved={cargarAhorros} />
    </div>
  )
}

export default Ahorros
