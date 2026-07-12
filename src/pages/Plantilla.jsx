import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowDownRight, ArrowUpRight, Wallet, Pencil } from 'lucide-react'
import db from '../db/index.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'
import IngresoFijoEditModal from '../components/IngresoFijoEditModal.jsx'
import IngresoEfimeroEditModal from '../components/IngresoEfimeroEditModal.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}
const formatearFecha = (s) => { if (!s) return ''; const [y, m, d] = s.split('T')[0].split('-'); return `${+d}/${+m}/${y}` }

function Plantilla() {
  const [data, setData] = useState({ ingresosFijos: [], ingresosEfimeros: [], gastadoMes: 0, totalEnMano: 0 })
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
      const [ingresosFijos, ingresosEfimeros, gastosDiarios, estado] = await Promise.all([
        db.ingresos_fijos.where('activo').equals(1).toArray(),
        db.ingresos_efimeros.where('fecha').between(inicioStr, finStr, true, false).toArray(),
        db.gastos_diarios.where('fecha').between(inicioStr, finStr, true, false).toArray(),
        db.estado_cuenta.get(1),
      ])
      const gastadoMes = gastosDiarios.reduce((s, g) => s + g.monto, 0)
      const totalSueldos = ingresosFijos.reduce((s, i) => s + i.monto, 0)
      setData({ ingresosFijos, ingresosEfimeros, gastadoMes, restanteMes: totalSueldos - gastadoMes, totalEnMano: estado?.total_en_mano ?? 0, totalSueldos })
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`

  return (
    <div className="space-y-5 animate-fade-in-up">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{mesActual}</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Gastado', value: data.gastadoMes, color: 'var(--color-negative)', icon: ArrowDownRight },
          { label: 'Restante', value: data.restanteMes, color: (data.restanteMes ?? 0) >= 0 ? 'var(--color-positive)' : 'var(--color-negative)', icon: ArrowUpRight },
          { label: 'Total', value: data.totalEnMano, color: 'var(--color-accent)', icon: Wallet },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl p-3 border animate-fade-in-up animate-scale-in" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</span>
                <Icon size={14} style={{ color: card.color }} />
              </div>
              <p className="text-sm font-bold" style={{ color: card.color }}>{formatearMoneda(card.value)}</p>
            </div>
          )
        })}
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Ingresos fijos</h3>
          <button onClick={() => setModalFijo(true)}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer"
            style={{ color: 'var(--color-accent)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.ingresosFijos.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sin ingresos fijos cargados</p>
        ) : (
          <div className="space-y-2">
            {data.ingresosFijos.map((ing, i) => (
              <div key={ing.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center animate-fade-in-up cursor-pointer hover:opacity-80 transition"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditFijo(ing)}>
                <div className="flex items-center gap-2">
                  <Pencil size={12} className="shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Día {ing.dia_cobro}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-positive)' }}>{formatearMoneda(ing.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Ingresos</h3>
          <button onClick={() => setModalEfimero(true)}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer"
            style={{ color: 'var(--color-accent)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.ingresosEfimeros.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sin ingresos este mes</p>
        ) : (
          <div className="space-y-2">
            {data.ingresosEfimeros.map((ing, i) => (
              <div key={ing.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center animate-fade-in-up cursor-pointer hover:opacity-80 transition"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.05}s` }}
                onClick={() => setEditEfimero(ing)}>
                <div className="flex items-center gap-2">
                  <Pencil size={12} className="shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatearFecha(ing.fecha)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-positive)' }}>{formatearMoneda(ing.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <IngresoFijoModal isOpen={modalFijo} onClose={() => setModalFijo(false)} onSaved={cargar} />
      <IngresoEfimeroModal isOpen={modalEfimero} onClose={() => setModalEfimero(false)} onSaved={cargar} />
      <IngresoFijoEditModal isOpen={!!editFijo} onClose={() => setEditFijo(null)} ingreso={editFijo} onSaved={cargar} />
      <IngresoEfimeroEditModal isOpen={!!editEfimero} onClose={() => setEditEfimero(null)} ingreso={editEfimero} onSaved={cargar} />
    </div>
  )
}

export default Plantilla
