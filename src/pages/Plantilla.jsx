import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowDownRight, ArrowUpRight, Wallet, Pencil, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import db from '../db/index.js'
import { obtenerCotizacionBlue, convertirARS } from '../db/moneda.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'
import IngresoFijoEditModal from '../components/IngresoFijoEditModal.jsx'
import IngresoEfimeroEditModal from '../components/IngresoEfimeroEditModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const formatearFecha = (s) => { if (!s) return ''; const [y, m, d] = s.split('T')[0].split('-'); return `${+d}/${+m}/${y}` }

function Plantilla() {
  const [data, setData] = useState({ ingresosFijos: [], ingresosEfimeros: [], gastadoMes: 0, totalEnMano: 0, gastosFijos: [] })
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalFijo, setModalFijo] = useState(false)
  const [modalEfimero, setModalEfimero] = useState(false)
  const [editFijo, setEditFijo] = useState(null)
  const [editEfimero, setEditEfimero] = useState(null)
  const [oculto, setOculto] = useState(() => {
    try { return localStorage.getItem('ocultarMontos') === '1' } catch { return false }
  })

  const toggleOculto = () => {
    setOculto((prev) => {
      const next = !prev
      try { localStorage.setItem('ocultarMontos', next ? '1' : '0') } catch { /* sin storage */ }
      return next
    })
  }

  const cargar = useCallback(async () => {
    try {
      const hoy = new Date()
      const m = hoy.getMonth(); const y = hoy.getFullYear()
      const inicioStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
      const finStr = m === 11 ? `${y + 1}-01-01` : `${y}-${String(m + 2).padStart(2, '0')}-01`
      const [ingresosFijos, ingresosEfimeros, gastosDiarios, gastosFijos, estado, cot] = await Promise.all([
        db.ingresos_fijos.where('activo').equals(1).toArray(),
        db.ingresos_efimeros.where('fecha').between(inicioStr, finStr, true, false).toArray(),
        db.gastos_diarios.where('fecha').between(inicioStr, finStr, true, false).toArray(),
        db.gastos_fijos.where('activo').equals(1).toArray(),
        db.estado_cuenta.get(1),
        obtenerCotizacionBlue(),
      ])
      const gastadoMes = gastosDiarios.reduce((s, g) => s + g.monto, 0)
      const totalSueldos = ingresosFijos.reduce((s, i) => s + i.monto, 0)
      setCotizacion(cot)
      setData({ ingresosFijos, ingresosEfimeros, gastadoMes, restanteMes: totalSueldos - gastadoMes, totalEnMano: estado?.total_en_mano ?? 0, totalSueldos, gastosFijos })
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    const handler = () => cargar()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargar])

  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`
  const totalGastosFijos = data.gastosFijos.reduce((s, g) => s + convertirARS(g.monto, g.moneda, cotizacion), 0)
  const totalIngresos = data.totalSueldos + data.ingresosEfimeros.reduce((s, i) => s + i.monto, 0)
  const totalGastosMes = data.gastadoMes + totalGastosFijos
  const porcentajeGastado = totalIngresos > 0 ? Math.min((data.gastadoMes / totalIngresos) * 100, 100) : 0
  const porcentajeFijos = data.totalSueldos > 0 ? Math.min((totalGastosMes / data.totalSueldos) * 100, 100) : 0
  const enNegativo = data.totalEnMano < 0
  const alertaPresupuesto = totalIngresos > 0 && data.gastadoMes > totalIngresos * 0.8

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center pt-2 space-y-2">
          <div className="h-7 w-28 mx-auto rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          <div className="h-4 w-36 mx-auto rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
        <div className="h-48 rounded-3xl" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        <SkeletonCard lines={[70, 40]} />
        <SkeletonCard lines={[60, 35]} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Plantilla</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{mesActual}</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-5 animate-scale-in"
        style={{
          background: enNegativo
            ? 'linear-gradient(135deg, var(--color-negative) 0%, color-mix(in srgb, var(--color-negative) 70%, #000) 100%)'
            : 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 65%, #7c2d12) 100%)',
          boxShadow: `0 12px 32px -12px ${enNegativo ? 'color-mix(in srgb, var(--color-negative) 60%, transparent)' : 'var(--color-accent-glow)'}`,
          color: '#fff',
        }}>
        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.18)' }}>
              <Wallet size={16} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ opacity: 0.9 }}>Total en mano</span>
          </div>
          <button onClick={toggleOculto} aria-label={oculto ? 'Mostrar montos' : 'Ocultar montos'}
            className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-all duration-200 active:scale-90"
            style={{ background: 'rgba(255,255,255,0.14)' }}>
            {oculto ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <p className="relative mt-4 text-4xl font-extrabold tracking-tight tabular-nums leading-none break-all">
          {oculto ? '$ •••••' : <AnimatedNumber value={data.totalEnMano} />}
        </p>
        <p className="relative mt-2 text-xs font-medium" style={{ opacity: 0.8 }}>
          {enNegativo ? 'Estás en negativo' : 'Disponible ahora'}
        </p>

        <div className="relative grid grid-cols-2 gap-2 mt-5">
          {[
            { label: 'Ingresos del mes', value: totalIngresos, icon: ArrowUpRight },
            { label: 'Gastado del mes', value: data.gastadoMes, icon: ArrowDownRight },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.14)' }}>
                <div className="flex items-center gap-1.5" style={{ opacity: 0.85 }}>
                  <Icon size={12} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="mt-1 text-sm font-bold tracking-tight tabular-nums">
                  {oculto ? '$ •••' : <AnimatedNumber value={item.value} />}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {data.totalSueldos > 0 && (
        <div className="rounded-2xl p-4 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: '0.16s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Gastos del mes</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-negative)' }}>{Math.round(porcentajeFijos)}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${porcentajeFijos}%`,
                background: porcentajeFijos > 80 ? 'var(--color-negative)' : porcentajeFijos > 50 ? '#f59e0b' : 'var(--color-accent)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}><AnimatedNumber value={totalGastosMes} /> / <AnimatedNumber value={data.totalSueldos} /></span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>gastos vs ingresos fijos</span>
          </div>
        </div>
      )}

      {alertaPresupuesto && (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 animate-fade-in-up"
          style={{ background: 'var(--color-negative-light)', border: '1px solid color-mix(in srgb, var(--color-negative) 25%, transparent)', animationDelay: '0.2s' }}>
          <AlertTriangle size={16} style={{ color: 'var(--color-negative)', flexShrink: 0 }} />
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--color-negative)' }}>¡Atención!</p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Ya gastaste el {Math.round(porcentajeGastado)}% de tus ingresos este mes</p>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Ingresos fijos</h3>
          <button onClick={() => setModalFijo(true)}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.ingresosFijos.length === 0 ? (
          <div className="rounded-2xl border p-5 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Sin ingresos fijos cargados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ingresosFijos.map((ing, i) => (
              <div key={ing.id} className="card-base rounded-2xl px-4 py-3 flex justify-between items-center animate-fade-in-up cursor-pointer active:scale-[0.98]"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditFijo(ing)}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'var(--color-positive-light)' }}>
                    <Pencil size={14} style={{ color: 'var(--color-positive)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Día {ing.dia_cobro}</p>
                  </div>
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-positive)' }}><AnimatedNumber value={ing.monto} /></p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Ingresos</h3>
          <button onClick={() => setModalEfimero(true)}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.ingresosEfimeros.length === 0 ? (
          <div className="rounded-2xl border p-5 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Sin ingresos este mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ingresosEfimeros.map((ing, i) => (
              <div key={ing.id} className="card-base rounded-2xl px-4 py-3 flex justify-between items-center animate-fade-in-up cursor-pointer active:scale-[0.98]"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditEfimero(ing)}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'var(--color-positive-light)' }}>
                    <Pencil size={14} style={{ color: 'var(--color-positive)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{formatearFecha(ing.fecha)}</p>
                  </div>
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-positive)' }}><AnimatedNumber value={ing.monto} /></p>
              </div>
            ))}
          </div>
        )}
      </section>

      <IngresoFijoModal isOpen={modalFijo} onClose={() => setModalFijo(false)} onSaved={cargar} />
      <IngresoEfimeroModal isOpen={modalEfimero} onClose={() => setModalEfimero(false)} onSaved={cargar} />
      <IngresoFijoEditModal key={editFijo?.id ?? 'none'} isOpen={!!editFijo} onClose={() => setEditFijo(null)} ingreso={editFijo} onSaved={cargar} />
      <IngresoEfimeroEditModal isOpen={!!editEfimero} onClose={() => setEditEfimero(null)} ingreso={editEfimero} onSaved={cargar} />
    </div>
  )
}

export default Plantilla
