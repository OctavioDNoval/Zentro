import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import db from '../db/index.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

function Plantilla() {
  const [data, setData] = useState({ ingresosFijos: [], ingresosEfimeros: [], gastadoMes: 0, totalEnMano: 0 })
  const [modalFijo, setModalFijo] = useState(false)
  const [modalEfimero, setModalEfimero] = useState(false)

  const cargar = useCallback(async () => {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    const [ingresosFijos, ingresosEfimeros, gastosDiarios, estado] = await Promise.all([
      db.ingresos_fijos.where({ activo: true }).toArray(),
      db.ingresos_efimeros.where('fecha').between(inicio, fin).toArray(),
      db.gastos_diarios.where('fecha').between(inicio, fin).toArray(),
      db.estado_cuenta.get(1),
    ])
    const gastadoMes = gastosDiarios.reduce((s, g) => s + g.monto, 0)
    const totalSueldos = ingresosFijos.reduce((s, i) => s + i.monto, 0)
    setData({ ingresosFijos, ingresosEfimeros, gastadoMes, restanteMes: totalSueldos - gastadoMes, totalEnMano: estado?.total_en_mano ?? 0, totalSueldos })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{mesActual}</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Gastado', value: data.gastadoMes, color: 'var(--color-negative)', icon: ArrowDownRight },
          { label: 'Restante', value: data.restanteMes, color: (data.restanteMes ?? 0) >= 0 ? 'var(--color-positive)' : 'var(--color-negative)', icon: ArrowUpRight },
          { label: 'Total', value: data.totalEnMano, color: 'var(--color-accent)', icon: Wallet },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl p-3 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
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
            {data.ingresosFijos.map((ing) => (
              <div key={ing.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Día {ing.dia_cobro}</p>
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
            {data.ingresosEfimeros.map((ing) => (
              <div key={ing.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ing.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(ing.fecha).toLocaleDateString('es-AR')}</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-positive)' }}>{formatearMoneda(ing.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <IngresoFijoModal isOpen={modalFijo} onClose={() => setModalFijo(false)} onSaved={cargar} />
      <IngresoEfimeroModal isOpen={modalEfimero} onClose={() => setModalEfimero(false)} onSaved={cargar} />
    </div>
  )
}

export default Plantilla
