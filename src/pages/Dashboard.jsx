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
    <div className="space-y-5 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Historial mensual</p>
      </div>

      {resumenes.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Todavía no hay cierres de mes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumenes.map((r, i) => (
            <div key={r.id} className="rounded-2xl p-5 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{formatearMes(r.mes)}</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: r.total_en_mano >= 0 ? 'var(--color-positive-light)' : 'var(--color-negative-light)' }}>
                  <Wallet size={12} style={{ color: r.total_en_mano >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }} />
                  <span className="text-xs font-bold" style={{ color: r.total_en_mano >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                    <AnimatedNumber value={r.total_en_mano} />
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-positive)' }}>Ingresos</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Fijos', value: r.total_ingresos_fijos },
                      { label: 'Ephemeros', value: r.total_ingresos_efimeros },
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
                      { label: 'Fijos', value: r.total_gastos_fijos },
                      { label: 'Diarios', value: r.total_gastos_diarios },
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
