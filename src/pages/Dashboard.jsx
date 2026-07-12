import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import db from '../db/index.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const formatearMes = (s) => { const [y, m] = s.split('-'); return `${meses[Number(m) - 1]} ${y}` }

function Dashboard() {
  const [resumenes, setResumenes] = useState([])

  const cargar = useCallback(async () => {
    setResumenes(await db.resumen_mensual.orderBy('mes').reverse().toArray())
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold tracking-tight text-center" style={{ color: 'var(--color-accent)' }}>Dashboard</h1>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Historial mensual</h2>
      {resumenes.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Todavía no hay cierres de mes</p>
      ) : (
        <div className="space-y-3">
          {resumenes.map((r, i) => (
            <div key={r.id} className="rounded-xl p-4 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.08}s` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>{formatearMes(r.mes)}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  { label: 'Ingresos fijos', value: r.total_ingresos_fijos, color: 'var(--color-positive)', icon: TrendingUp },
                  { label: 'Ingresos', value: r.total_ingresos_efimeros, color: 'var(--color-positive)', icon: TrendingUp },
                  { label: 'Gastos fijos', value: r.total_gastos_fijos, color: 'var(--color-negative)', icon: TrendingDown },
                  { label: 'Gastos diarios', value: r.total_gastos_diarios, color: 'var(--color-negative)', icon: TrendingDown },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} style={{ color: item.color }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                      </div>
                      <span className="font-medium" style={{ color: item.color }}><AnimatedNumber value={item.value} /></span>
                    </div>
                  )
                })}
              </div>
              <hr className="my-2" style={{ borderColor: 'var(--color-border)' }} />
              <div className="flex items-center justify-between text-sm font-semibold">
                <div className="flex items-center gap-1.5">
                  <Wallet size={14} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Total en mano</span>
                </div>
                <span style={{ color: r.total_en_mano >= 0 ? 'var(--color-accent)' : 'var(--color-negative)' }}>
                  <AnimatedNumber value={r.total_en_mano} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
