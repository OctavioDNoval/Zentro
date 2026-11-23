import { useState, useEffect, useCallback } from 'react'
import { ArrowDownRight, ArrowUpRight, Wallet, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import db from '../db/index.js'
import { calcularReporte } from '../db/ciclo-mensual.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Plantilla() {
  const [data, setData] = useState({ totalEnMano: 0, ingresosMes: 0, gastosMes: 0 })
  const [loading, setLoading] = useState(true)
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
      const mes = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      // Los números del mes salen del mismo cálculo que usa el Dashboard
      const [estado, reporte] = await Promise.all([db.estado_cuenta.get(1), calcularReporte(mes)])
      setData({
        totalEnMano: estado?.total_en_mano ?? 0,
        ingresosMes: reporte.total_ingresos,
        gastosMes: reporte.total_gastos,
      })
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
  const porcentajeGastado = data.ingresosMes > 0 ? Math.min((data.gastosMes / data.ingresosMes) * 100, 100) : 0
  const enNegativo = data.totalEnMano < 0
  const alertaPresupuesto = data.ingresosMes > 0 && data.gastosMes > data.ingresosMes * 0.8

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
            { label: 'Ingresos del mes', value: data.ingresosMes, icon: ArrowUpRight },
            { label: 'Gastos del mes', value: data.gastosMes, icon: ArrowDownRight },
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

      {data.ingresosMes > 0 && (
        <div className="rounded-2xl p-4 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: '0.16s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Gastos del mes</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-negative)' }}>{Math.round(porcentajeGastado)}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${porcentajeGastado}%`,
                background: porcentajeGastado > 80 ? 'var(--color-negative)' : porcentajeGastado > 50 ? '#f59e0b' : 'var(--color-accent)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}><AnimatedNumber value={data.gastosMes} /> / <AnimatedNumber value={data.ingresosMes} /></span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>gastos vs ingresos del mes</span>
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

    </div>
  )
}

export default Plantilla
