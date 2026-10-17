import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, RefreshCw, Pencil, Wallet, TrendingUp } from 'lucide-react'
import db from '../db/index.js'
import { CASAS, fetchCotizaciones, formatearARS as formatARS, formatearUSD as formatUSD } from '../db/moneda.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import AhorroModal from '../components/AhorroModal.jsx'
import AhorroEditModal from '../components/AhorroEditModal.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'

const NOMBRES_CASA = { blue: 'Blue', oficial: 'Oficial', mep: 'MEP', ccl: 'CCL' }
const COLORES_CASA = {
  blue: { bg: '#1e3a5f', text: '#60a5fa', border: '#2563eb' },
  oficial: { bg: '#052e16', text: '#4ade80', border: '#16a34a' },
  mep: { bg: '#2e1065', text: '#a78bfa', border: '#7c3aed' },
  ccl: { bg: '#431407', text: '#fb923c', border: '#ea580c' },
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

function Ahorros() {
  const [ahorros, setAhorros] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(true)
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
    Promise.all([cargarAhorros(), cargarCotizaciones()]).then(() => setLoading(false))
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center pt-2">
          <div className="h-7 w-20 mx-auto rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
        <div className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="h-3 w-32 rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-14 rounded-xl" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
        <SkeletonCard lines={[50, 30]} />
        <SkeletonCard lines={[60, 35]} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Ahorros</h1>
      </div>

      <section className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Cotizaciones USD</span>
          <button onClick={cargarCotizaciones} disabled={fetching}
            className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-90 cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
            <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CASAS.map((casa) => {
            const c = cotizaciones.find(c => c.casa === casa)
            const colores = COLORES_CASA[casa]
            return (
              <div key={casa} className="rounded-xl p-2.5 text-center border transition-all duration-200"
                style={{ background: colores.bg, borderColor: `${colores.border}40` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colores.text }}>{NOMBRES_CASA[casa]}</p>
                <p className="text-xs font-bold" style={{ color: colores.text }}>
                  {c ? '$' + Number(c.venta).toLocaleString('es-AR') : '-'}
                </p>
              </div>
            )
          })}
        </div>
        {lastUpdated && (
          <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            Actualizado {formatearUltimaActualizacion(lastUpdated)}
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total en ARS', value: totalEnARS, format: formatARS, color: 'var(--color-accent)', bg: 'var(--color-accent-light)', icon: Wallet },
          { label: 'Total en USD', value: totalEnUSD, format: formatUSD, color: 'var(--color-positive)', bg: 'var(--color-positive-light)', icon: TrendingUp },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl p-4 border animate-fade-in-up animate-scale-in transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{card.label}</span>
                <div className="flex items-center justify-center w-6 h-6 rounded-lg" style={{ background: card.bg }}>
                  <Icon size={12} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-base font-bold tracking-tight" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} format={card.format} />
              </p>
              {blue && (
                <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Blue ${Number(blue.venta).toLocaleString('es-AR')}</p>
              )}
            </div>
          )
        })}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Tus ahorros</h3>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {ahorros.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Sin ahorros todavía</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Agregá tu primer ahorro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ahorros.map((a, i) => (
              <div key={a.id} className="card-base rounded-2xl px-4 py-3 flex justify-between items-center animate-fade-in-up cursor-pointer active:scale-[0.98]"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditAhorro(a)}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: a.moneda === 'ARS' ? 'var(--color-accent-light)' : 'var(--color-positive-light)' }}>
                    <Pencil size={14} style={{ color: a.moneda === 'ARS' ? 'var(--color-accent)' : 'var(--color-positive)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{a.nombre}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold mt-0.5 inline-block"
                      style={{ background: a.moneda === 'ARS' ? 'var(--color-accent-light)' : 'var(--color-positive-light)', color: a.moneda === 'ARS' ? 'var(--color-accent)' : 'var(--color-positive)' }}>
                      {a.moneda}
                    </span>
                    {a.descontadoDeTotal && (
                      <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold mt-0.5 inline-block ml-1"
                        style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}>
                        Del total
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold" style={{ color: a.moneda === 'ARS' ? 'var(--color-accent)' : 'var(--color-positive)' }}>
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
