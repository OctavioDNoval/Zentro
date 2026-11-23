import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import db from '../db/index.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'
import IngresoFijoEditModal from '../components/IngresoFijoEditModal.jsx'
import IngresoEfimeroEditModal from '../components/IngresoEfimeroEditModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'
import GrupoFecha, { FilaMovimiento, Chip } from '../components/GrupoFecha.jsx'
import IconoMovimiento from '../components/IconoMovimiento.jsx'
import { agruparPorFecha } from '../utils/fechas.js'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Ingresos() {
  const [data, setData] = useState({ ingresosFijos: [], ingresosEfimeros: [] })
  const [loading, setLoading] = useState(true)
  const [modalFijo, setModalFijo] = useState(false)
  const [modalEfimero, setModalEfimero] = useState(false)
  const [editFijo, setEditFijo] = useState(null)
  const [editEfimero, setEditEfimero] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const hoy = new Date()
      const m = hoy.getMonth(); const y = hoy.getFullYear()
      const inicioStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
      const finStr = m === 11 ? `${y + 1}-01-01` : `${y}-${String(m + 2).padStart(2, '0')}-01`
      const [ingresosFijos, ingresosEfimeros] = await Promise.all([
        db.ingresos_fijos.where('activo').equals(1).toArray(),
        db.ingresos_efimeros.where('fecha').between(inicioStr, finStr, true, false).reverse().toArray(),
      ])
      setData({ ingresosFijos, ingresosEfimeros })
    } catch (err) {
      console.error('Error cargando ingresos:', err)
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
  const totalFijos = data.ingresosFijos.reduce((s, i) => s + i.monto, 0)
  const totalEfimeros = data.ingresosEfimeros.reduce((s, i) => s + i.monto, 0)

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <SkeletonCard lines={[50, 30]} />
        <SkeletonCard lines={[70, 40]} />
        <SkeletonCard lines={[60, 35]} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Ingresos</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{mesActual}</p>
      </div>

      <div className="rounded-2xl p-4 border animate-scale-in" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Ingresos del mes</span>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'var(--color-positive-light)' }}>
            <TrendingUp size={14} style={{ color: 'var(--color-positive)' }} />
          </div>
        </div>
        <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums" style={{ color: 'var(--color-positive)' }}>
          <AnimatedNumber value={totalFijos + totalEfimeros} />
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: 'Fijos', value: totalFijos },
            { label: 'Variables', value: totalEfimeros },
          ].map((item) => (
            <div key={item.label} className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}><AnimatedNumber value={item.value} /></p>
            </div>
          ))}
        </div>
      </div>

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
          <div className="rounded-2xl border overflow-hidden animate-fade-in-up [&>*+*]:border-t [&>*+*]:border-[var(--color-border-subtle)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            {data.ingresosFijos.map((ing) => (
              <FilaMovimiento key={ing.id} onClick={() => setEditFijo(ing)}
                icono={<IconoMovimiento tipo="sueldo" />}
                titulo={ing.nombre}
                subtitulo={<Chip color="#16a34a">Cobra el día {ing.dia_cobro}</Chip>}
                monto={<>+<AnimatedNumber value={ing.monto} /></>}
                color="var(--color-positive)" />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Ingresos variables</h3>
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
          <div className="space-y-4">
            {agruparPorFecha(data.ingresosEfimeros).map((grupo, gi) => (
              <GrupoFecha key={grupo.fecha} etiqueta={grupo.etiqueta} total={grupo.total} delay={gi * 0.05}>
                {grupo.items.map((ing) => (
                  <FilaMovimiento key={ing.id} onClick={() => setEditEfimero(ing)}
                    icono={<IconoMovimiento tipo="ingreso" />}
                    titulo={ing.nombre}
                    monto={<>+<AnimatedNumber value={ing.monto} /></>}
                    color="var(--color-positive)" />
                ))}
              </GrupoFecha>
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

export default Ingresos
