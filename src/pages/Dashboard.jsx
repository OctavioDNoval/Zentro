import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import db from '../db/index.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { SkeletonDashboard } from '../components/Skeleton.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const formatearMes = (s) => { const [y, m] = s.split('-'); return `${meses[Number(m) - 1]} ${y}` }

function Dashboard() {
  const [resumenes, setResumenes] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setResumenes(await db.resumen_mensual.orderBy('mes').reverse().toArray())
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelado = false

    db.resumen_mensual.orderBy('mes').reverse().toArray()
      .then((data) => {
        if (cancelado) return
        setResumenes(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando reportes:', err)
        if (!cancelado) setLoading(false)
      })

    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    const handler = () => cargar()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargar])

  const ultimo = resumenes[0]
  const totalIngresos = ultimo
    ? (ultimo.total_ingresos ?? ((ultimo.total_ingresos_fijos ?? 0) + (ultimo.total_ingresos_efimeros ?? 0)))
    : 0
  const totalGastos = ultimo
    ? (ultimo.total_gastos ?? ((ultimo.total_gastos_fijos ?? 0) + (ultimo.total_gastos_diarios ?? 0)))
    : 0
  const diferencia = ultimo ? (ultimo.diferencia ?? ultimo.ahorro ?? (totalIngresos - totalGastos)) : 0

  if (loading) return <SkeletonDashboard />

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Reportes mensuales</p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Los reportes no modifican el total en mano</p>
      </div>

      {ultimo && (
        <div className="rounded-2xl p-4 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Último cierre · {formatearMes(ultimo.mes)}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Ingresos', value: totalIngresos, color: 'var(--color-positive)', bg: 'var(--color-positive-light)', icon: ArrowUpRight },
              { label: 'Gastos', value: totalGastos, color: 'var(--color-negative)', bg: 'var(--color-negative-light)', icon: ArrowDownRight },
              { label: 'Diferencia', value: diferencia, color: diferencia >= 0 ? 'var(--color-accent)' : 'var(--color-negative)', bg: diferencia >= 0 ? 'var(--color-accent-light)' : 'var(--color-negative-light)', icon: Wallet },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="text-center">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg mx-auto mb-1.5" style={{ background: card.bg }}>
                    <Icon size={13} style={{ color: card.color }} />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{card.label}</p>
                  <p className="text-sm font-bold tracking-tight" style={{ color: card.color }}><AnimatedNumber value={card.value} /></p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {resumenes.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Todavía no hay reportes mensuales</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumenes.map((r, i) => {
            const ingresosReporte = r.total_ingresos ?? ((r.total_ingresos_fijos ?? 0) + (r.total_ingresos_efimeros ?? 0))
            const gastosReporte = r.total_gastos ?? ((r.total_gastos_fijos ?? 0) + (r.total_gastos_diarios ?? 0))
            const diferenciaReporte = r.diferencia ?? r.ahorro ?? (ingresosReporte - gastosReporte)

            return (
              <div key={r.id} className="rounded-2xl p-5 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{formatearMes(r.mes)}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-positive)' }}>Ingresos</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Fijos', value: r.total_ingresos_fijos ?? 0 },
                        { label: 'Ephemeros', value: r.total_ingresos_efimeros ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={12} style={{ color: 'var(--color-positive)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-positive)' }}><AnimatedNumber value={item.value} /></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'var(--color-border)' }} />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-negative)' }}>Gastos</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Fijos', value: r.total_gastos_fijos ?? 0 },
                        { label: 'Diarios', value: r.total_gastos_diarios ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingDown size={12} style={{ color: 'var(--color-negative)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-negative)' }}><AnimatedNumber value={item.value} /></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'var(--color-border)' }} />

                  <div className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: diferenciaReporte >= 0 ? 'var(--color-accent-light)' : 'var(--color-negative-light)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: diferenciaReporte >= 0 ? 'var(--color-accent)' : 'var(--color-negative)' }}>Diferencia</span>
                    <span className="text-xs font-bold" style={{ color: diferenciaReporte >= 0 ? 'var(--color-accent)' : 'var(--color-negative)' }}>
                      <AnimatedNumber value={diferenciaReporte} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dashboard
