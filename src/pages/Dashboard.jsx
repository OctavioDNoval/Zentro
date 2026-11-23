import { useState, useEffect, useCallback } from 'react'
import { ArrowUpRight, ArrowDownRight, Info, ChevronDown, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import db from '../db/index.js'
import { calcularReporte } from '../db/ciclo-mensual.js'
import { formatearARSCompacto } from '../db/moneda.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { EncabezadoPagina, EncabezadoSeccion, EstadoVacio, ListaCard, SkeletonPagina } from '../components/Seccion.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const mesesCortos = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const pad = (n) => String(n).padStart(2, '0')
const mesActualStr = () => `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}`
const nombreMes = (s) => { const [y, m] = s.split('-'); return `${meses[Number(m) - 1]} ${y}` }
const nombreCorto = (s) => mesesCortos[Number(s.split('-')[1]) - 1]
const fmt = (n) => formatearARSCompacto(Math.round(n))
const fmtSigno = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n))
const colorBalance = (n) => (n >= 0 ? 'var(--color-positive)' : 'var(--color-negative)')

// Normaliza reportes viejos y nuevos a los mismos campos
function totales(r) {
  const ingresosFijos = r.total_ingresos_fijos ?? 0
  const ingresosVariables = r.total_ingresos_efimeros ?? 0
  const gastosFijos = r.total_gastos_fijos ?? 0
  const gastosDiarios = r.total_gastos_diarios ?? 0
  const ingresos = r.total_ingresos ?? ingresosFijos + ingresosVariables
  const gastos = r.total_gastos ?? gastosFijos + gastosDiarios
  const balance = r.diferencia ?? r.ahorro ?? ingresos - gastos
  return { mes: r.mes, ingresosFijos, ingresosVariables, gastosFijos, gastosDiarios, ingresos, gastos, balance }
}

function MesEnVivo({ actual, anterior }) {
  const pctGastado = actual.ingresos > 0 ? Math.min((actual.gastos / actual.ingresos) * 100, 100) : 0
  const excedido = actual.ingresos > 0 && actual.gastos > actual.ingresos
  const dif = anterior ? actual.balance - anterior.balance : null

  return (
    <div className="rounded-2xl p-4 border animate-scale-in" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Balance del mes</span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
          style={{ color: 'var(--color-positive)', background: 'var(--color-positive-light)' }}>
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'var(--color-positive)', opacity: 0.6 }} />
            <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-positive)' }} />
          </span>
          En vivo
        </span>
      </div>

      <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums" style={{ color: colorBalance(actual.balance) }}>
        <AnimatedNumber value={actual.balance} format={fmtSigno} />
      </p>
      {dif != null && (
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {dif > 0 ? <TrendingUp size={13} style={{ color: 'var(--color-positive)' }} /> : dif < 0 ? <TrendingDown size={13} style={{ color: 'var(--color-negative)' }} /> : <Minus size={13} style={{ color: 'var(--color-text-tertiary)' }} />}
          <span className="font-semibold tabular-nums" style={{ color: dif > 0 ? 'var(--color-positive)' : dif < 0 ? 'var(--color-negative)' : 'var(--color-text-secondary)' }}>{fmtSigno(dif)}</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>vs {meses[Number(anterior.mes.split('-')[1]) - 1].toLowerCase()}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          { label: 'Ingresos', value: actual.ingresos, icon: ArrowUpRight, color: 'var(--color-positive)', detalle: `Fijos ${fmt(actual.ingresosFijos)} · Var. ${fmt(actual.ingresosVariables)}` },
          { label: 'Gastos', value: actual.gastos, icon: ArrowDownRight, color: 'var(--color-negative)', detalle: `Fijos ${fmt(actual.gastosFijos)} · Diar. ${fmt(actual.gastosDiarios)}` },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
              <div className="flex items-center gap-1">
                <Icon size={12} style={{ color: item.color }} />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
              </div>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}><AnimatedNumber value={item.value} /></p>
              <p className="text-[10px] tabular-nums truncate" style={{ color: 'var(--color-text-tertiary)' }}>{item.detalle}</p>
            </div>
          )
        })}
      </div>

      {actual.ingresos > 0 && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pctGastado}%`, background: excedido ? 'var(--color-negative)' : pctGastado > 80 ? '#f59e0b' : 'var(--color-accent)' }} />
          </div>
          <p className="text-[10px] mt-1.5 font-semibold tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
            {excedido ? 'Gastaste más de lo que entró este mes' : `Gastaste el ${Math.round(pctGastado)}% de lo que entró`}
          </p>
        </div>
      )}

      <div className="flex items-start gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Info size={13} className="shrink-0 mt-px" style={{ color: 'var(--color-text-tertiary)' }} />
        <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-tertiary)' }}>
          Es solo un cálculo de ingresos menos gastos: no modifica tu total en mano ni tus ahorros.
        </p>
      </div>
    </div>
  )
}

// Barras divergentes: balance positivo hacia arriba (verde), negativo hacia abajo (rojo)
function Evolucion({ datos }) {
  const [sel, setSel] = useState(null)
  const maxPos = Math.max(0, ...datos.map((d) => d.balance))
  const maxNeg = Math.max(0, ...datos.map((d) => -d.balance))
  const rango = maxPos + maxNeg || 1
  const cero = (maxPos / rango) * 100 // % desde arriba donde va la línea del cero
  const activo = sel != null ? datos[sel] : null

  return (
    <div className="rounded-2xl p-4 border animate-fade-in-up" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="h-9 mb-1">
        {activo ? (
          <div>
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{nombreMes(activo.mes)}{activo.enCurso ? ' · en curso' : ''}</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: colorBalance(activo.balance) }}>{fmtSigno(activo.balance)}</p>
          </div>
        ) : (
          <p className="text-[11px] pt-1" style={{ color: 'var(--color-text-tertiary)' }}>Balance de cada mes · tocá una barra</p>
        )}
      </div>
      <div className="relative h-32" onMouseLeave={() => setSel(null)}>
        <div className="absolute inset-x-0 h-px z-10" style={{ top: `${cero}%`, background: 'var(--color-border)' }} />
        <div className="absolute inset-0 flex gap-2">
          {datos.map((d, i) => {
            const alto = (Math.abs(d.balance) / rango) * 100
            const positivo = d.balance >= 0
            const atenuar = sel != null && sel !== i
            return (
              <button key={d.mes} type="button" aria-label={`${nombreMes(d.mes)}: ${fmtSigno(d.balance)}`}
                className="relative flex-1 h-full cursor-pointer"
                onMouseEnter={() => setSel(i)} onClick={() => setSel(sel === i ? null : i)}>
                <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-10 transition-all duration-500"
                  style={{
                    top: positivo ? `${cero - alto}%` : `${cero}%`,
                    height: `${Math.max(alto, d.balance !== 0 ? 1.5 : 0)}%`,
                    borderRadius: positivo ? '4px 4px 0 0' : '0 0 4px 4px',
                    background: positivo ? 'var(--color-positive)' : 'var(--color-negative)',
                    opacity: atenuar ? 0.3 : d.enCurso ? 0.55 : 1,
                  }} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2 mt-1.5">
        {datos.map((d) => (
          <span key={d.mes} className="flex-1 text-center text-[10px] font-medium" style={{ color: d.enCurso ? 'var(--color-text)' : 'var(--color-text-tertiary)' }}>
            {nombreCorto(d.mes)}
          </span>
        ))}
      </div>
    </div>
  )
}

function FilaHistorial({ r, abierto, onToggle }) {
  return (
    <div>
      <button type="button" onClick={onToggle} aria-expanded={abierto}
        className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-secondary)]"
        style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: 'color-mix(in srgb, #2563eb 14%, transparent)' }}>
          <Calendar size={18} style={{ color: '#2563eb' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{nombreMes(r.mes)}</p>
          <p className="text-[11px] tabular-nums truncate" style={{ color: 'var(--color-text-tertiary)' }}>
            Entró {fmt(r.ingresos)} · Salió {fmt(r.gastos)}
          </p>
        </div>
        <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: colorBalance(r.balance) }}>{fmtSigno(r.balance)}</span>
        <ChevronDown size={16} className="shrink-0 transition-transform duration-200" style={{ color: 'var(--color-text-tertiary)', transform: abierto ? 'rotate(180deg)' : 'none' }} />
      </button>
      {abierto && (
        <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-2 animate-fade-in-up" style={{ background: 'var(--color-surface)' }}>
          {[
            ['Ingresos fijos', r.ingresosFijos, 'var(--color-positive)'],
            ['Ingresos variables', r.ingresosVariables, 'var(--color-positive)'],
            ['Gastos fijos', r.gastosFijos, 'var(--color-negative)'],
            ['Gastos diarios', r.gastosDiarios, 'var(--color-negative)'],
          ].map(([label, valor, color]) => (
            <div key={label} className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{label}</p>
              <p className="text-sm font-bold tabular-nums" style={{ color }}>{fmt(valor)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function leerDatos() {
  const mes = mesActualStr()
  const [guardados, enCurso] = await Promise.all([
    db.resumen_mensual.orderBy('mes').reverse().toArray(),
    calcularReporte(mes),
  ])
  return { guardados, enCurso, mes }
}

function Dashboard() {
  const [reportes, setReportes] = useState([])
  const [actual, setActual] = useState(null)
  const [abierto, setAbierto] = useState(null)
  const [loading, setLoading] = useState(true)

  const aplicar = useCallback(({ guardados, enCurso, mes }) => {
    setReportes(guardados.filter((r) => r.mes !== mes).map(totales))
    setActual(totales(enCurso))
    setLoading(false)
  }, [])

  const cargar = useCallback(() => {
    leerDatos().then(aplicar).catch((err) => {
      console.error('Error cargando el dashboard:', err)
      setLoading(false)
    })
  }, [aplicar])

  useEffect(() => {
    let cancelado = false
    leerDatos()
      .then((datos) => { if (!cancelado) aplicar(datos) })
      .catch((err) => {
        console.error('Error cargando el dashboard:', err)
        if (!cancelado) setLoading(false)
      })
    return () => { cancelado = true }
  }, [aplicar])

  useEffect(() => {
    const handler = () => cargar()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargar])

  if (loading || !actual) return <SkeletonPagina />

  const evolucion = [...reportes.slice(0, 5).reverse(), { ...actual, enCurso: true }]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EncabezadoPagina titulo="Dashboard" subtitulo={`${nombreMes(actual.mes)} · en curso`} />

      <MesEnVivo actual={actual} anterior={reportes[0]} />

      {evolucion.length > 1 && (
        <section>
          <EncabezadoSeccion titulo="Evolución" />
          <Evolucion datos={evolucion} />
        </section>
      )}

      <section>
        <EncabezadoSeccion titulo="Meses cerrados" />
        {reportes.length === 0 ? (
          <EstadoVacio>Todavía no cerraste ningún mes</EstadoVacio>
        ) : (
          <ListaCard>
            {reportes.map((r) => (
              <FilaHistorial key={r.mes} r={r} abierto={abierto === r.mes} onToggle={() => setAbierto(abierto === r.mes ? null : r.mes)} />
            ))}
          </ListaCard>
        )}
      </section>
    </div>
  )
}

export default Dashboard
