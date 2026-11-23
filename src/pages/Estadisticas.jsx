import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import db from '../db/index.js'
import { formatearARSCompacto } from '../db/moneda.js'
import { SkeletonCard } from '../components/Skeleton.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const mesesCortos = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const diasCortos = ['Lu','Ma','Mi','Ju','Vi','Sá','Do']

const pad = (n) => String(n).padStart(2, '0')
const aStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const desdeStr = (s) => { const [y, m, d] = s.split('T')[0].split('-').map(Number); return new Date(y, m - 1, d) }
const fmt = (n) => formatearARSCompacto(Math.round(n))

// Rango [inicio, fin) del período que contiene `ref`, desplazado `offset` períodos
function rango(periodo, ref, offset = 0) {
  const y = ref.getFullYear(); const m = ref.getMonth(); const d = ref.getDate()
  if (periodo === 'dia') return [new Date(y, m, d + offset), new Date(y, m, d + offset + 1)]
  if (periodo === 'mes') return [new Date(y, m + offset, 1), new Date(y, m + offset + 1, 1)]
  return [new Date(y + offset, 0, 1), new Date(y + offset + 1, 0, 1)]
}

function etiquetaPeriodo(periodo, ref) {
  if (periodo === 'dia') {
    const hoy = new Date()
    if (aStr(ref) === aStr(hoy)) return 'Hoy'
    const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)
    if (aStr(ref) === aStr(ayer)) return 'Ayer'
    return `${diasSemana[ref.getDay()]} ${ref.getDate()} de ${meses[ref.getMonth()].toLowerCase()}`
  }
  if (periodo === 'mes') return `${meses[ref.getMonth()]} ${ref.getFullYear()}`
  return String(ref.getFullYear())
}

const nombrePrevio = { dia: 'el día anterior', mes: 'el mes anterior', anio: 'el año anterior' }

function Card({ children, className = '', style }) {
  return (
    <div className={`rounded-2xl p-4 border animate-fade-in-up ${className}`}
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', ...style }}>
      {children}
    </div>
  )
}

function Titulo({ children, extra }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{children}</span>
      {extra}
    </div>
  )
}

// Gráfico de barras de una sola serie. `datos`: [{ label, valor, detalle }]
function GraficoBarras({ datos, promedio, etiquetaCada = 1, resaltar }) {
  const [sel, setSel] = useState(null)
  const max = Math.max(...datos.map((d) => d.valor), 0)
  const escala = max > 0 ? max * 1.1 : 1
  const activo = sel != null ? datos[sel] : null

  return (
    <div>
      <div className="h-9 mb-1">
        {activo ? (
          <div>
            <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{activo.detalle}</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(activo.valor)}</p>
          </div>
        ) : (
          <p className="text-[11px] pt-1" style={{ color: 'var(--color-text-tertiary)' }}>Tocá una barra para ver el detalle</p>
        )}
      </div>

      <div className="relative h-40" onMouseLeave={() => setSel(null)}>
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'var(--color-border)' }} />
        {promedio > 0 && (
          <div className="absolute inset-x-0 pointer-events-none z-10" style={{ bottom: `${(promedio / escala) * 100}%` }}>
            <div className="border-t border-dashed" style={{ borderColor: 'var(--color-text-tertiary)' }} />
            <span className="absolute right-0 -top-4 text-[9px] font-semibold px-1 rounded"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface)' }}>
              prom. {fmt(promedio)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-end" style={{ gap: datos.length > 20 ? 2 : 4 }}>
          {datos.map((d, i) => {
            const alto = d.valor > 0 ? Math.max((d.valor / escala) * 100, 2) : 0
            const esSel = sel === i
            const atenuar = sel != null && !esSel
            return (
              <button key={i} type="button" aria-label={`${d.detalle}: ${fmt(d.valor)}`}
                className="relative flex-1 h-full flex items-end cursor-pointer"
                onMouseEnter={() => setSel(i)} onClick={() => setSel(esSel ? null : i)}>
                <div className="w-full transition-all duration-500 ease-out"
                  style={{
                    height: `${alto}%`,
                    borderRadius: '4px 4px 0 0',
                    background: 'var(--color-accent)',
                    opacity: atenuar ? 0.35 : (resaltar === i || esSel || sel == null ? 1 : 0.6),
                    outline: resaltar === i && sel == null ? '2px solid var(--color-accent-glow)' : 'none',
                  }} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex mt-1.5" style={{ gap: datos.length > 20 ? 2 : 4 }}>
        {datos.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9px] tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
            {i % etiquetaCada === 0 || i === datos.length - 1 ? d.label : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function Categorias({ gastos, categorias }) {
  const total = gastos.reduce((s, g) => s + g.monto, 0)
  const porCat = useMemo(() => {
    const mapa = new Map()
    for (const g of gastos) mapa.set(g.categoriaId, (mapa.get(g.categoriaId) ?? 0) + g.monto)
    return [...mapa.entries()]
      .map(([id, valor]) => ({ nombre: categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría', valor }))
      .sort((a, b) => b.valor - a.valor)
  }, [gastos, categorias])

  if (porCat.length === 0) return null
  const max = porCat[0].valor

  return (
    <Card>
      <Titulo>Por categoría</Titulo>
      <div className="space-y-3">
        {porCat.map((c) => (
          <div key={c.nombre}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{c.nombre}</span>
              <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{fmt(c.valor)}</span>
                {' · '}{Math.round((c.valor / total) * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(c.valor / max) * 100}%`, background: 'var(--color-accent)' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Variacion({ actual, anterior, periodo }) {
  if (!anterior) return null
  const pct = ((actual - anterior) / anterior) * 100
  const subio = pct > 0.5; const bajo = pct < -0.5
  const Icon = subio ? TrendingUp : bajo ? TrendingDown : Minus
  // Gastar más es "malo": rojo si sube, verde si baja
  const color = subio ? 'var(--color-negative)' : bajo ? 'var(--color-positive)' : 'var(--color-text-secondary)'
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Icon size={13} style={{ color }} />
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{subio ? '+' : ''}{Math.round(pct)}%</span>
      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>vs {nombrePrevio[periodo]}</span>
    </div>
  )
}

function Estadisticas() {
  const [periodo, setPeriodo] = useState('mes')
  const [ref, setRef] = useState(() => new Date())
  const [gastos, setGastos] = useState([])
  const [anterior, setAnterior] = useState(0)
  const [promedioMesDia, setPromedioMesDia] = useState(0)
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const [ini, fin] = rango(periodo, ref)
      const [iniPrev, finPrev] = rango(periodo, ref, -1)
      const [actuales, previos, cats] = await Promise.all([
        db.gastos_diarios.where('fecha').between(aStr(ini), aStr(fin), true, false).toArray(),
        db.gastos_diarios.where('fecha').between(aStr(iniPrev), aStr(finPrev), true, false).toArray(),
        db.categorias.toArray(),
      ])
      let promDia = 0
      if (periodo === 'dia') {
        const [iniMes] = rango('mes', ref)
        const delMes = await db.gastos_diarios.where('fecha').between(aStr(iniMes), aStr(ref), true, false).toArray()
        const dias = ref.getDate() - 1
        promDia = dias > 0 ? delMes.reduce((s, g) => s + g.monto, 0) / dias : 0
      }
      setGastos(actuales)
      setAnterior(previos.reduce((s, g) => s + g.monto, 0))
      setPromedioMesDia(promDia)
      setCategorias(cats)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoading(false)
    }
  }, [periodo, ref])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    const handler = () => cargar()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargar])

  const hoy = new Date()
  const [, finActual] = rango(periodo, ref)
  const esPeriodoActual = finActual > hoy
  const mover = (dir) => {
    const [ini] = rango(periodo, ref, dir)
    if (ini > hoy) return
    setRef(ini)
  }
  const cambiarPeriodo = (p) => { setPeriodo(p); setRef(new Date()) }

  const total = gastos.reduce((s, g) => s + g.monto, 0)

  // Series para el gráfico
  const serie = useMemo(() => {
    const hoy = new Date()
    if (periodo === 'mes') {
      const y = ref.getFullYear(); const m = ref.getMonth()
      const dias = new Date(y, m + 1, 0).getDate()
      const valores = Array(dias).fill(0)
      for (const g of gastos) valores[desdeStr(g.fecha).getDate() - 1] += g.monto
      return valores.map((valor, i) => {
        const f = new Date(y, m, i + 1)
        return { label: String(i + 1), valor, detalle: `${diasSemana[f.getDay()]} ${i + 1} de ${meses[m].toLowerCase()}`, futuro: f > hoy }
      })
    }
    if (periodo === 'anio') {
      const valores = Array(12).fill(0)
      for (const g of gastos) valores[desdeStr(g.fecha).getMonth()] += g.monto
      return valores.map((valor, i) => ({ label: mesesCortos[i][0], valor, detalle: `${meses[i]} ${ref.getFullYear()}`, futuro: new Date(ref.getFullYear(), i, 1) > hoy }))
    }
    return []
  }, [periodo, ref, gastos])

  // Promedio solo sobre los días/meses transcurridos
  const transcurridos = serie.filter((d) => !d.futuro)
  const promedio = transcurridos.length ? total / transcurridos.length : 0
  const pico = serie.reduce((best, d, i) => (d.valor > (serie[best]?.valor ?? 0) ? i : best), -1)

  const porDiaSemana = useMemo(() => {
    const valores = Array(7).fill(0)
    for (const g of gastos) valores[(desdeStr(g.fecha).getDay() + 6) % 7] += g.monto
    return valores.map((valor, i) => ({ label: diasCortos[i], valor, detalle: `Total de los ${diasSemana[(i + 1) % 7].toLowerCase()}${i >= 5 ? 's' : ''}` }))
  }, [gastos])

  const masGrandes = [...gastos].sort((a, b) => b.monto - a.monto).slice(0, periodo === 'dia' ? 50 : 5)
  const getCat = (id) => categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría'

  // Proyección de fin de mes (solo mes en curso)
  const diasMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
  const proyeccion = periodo === 'mes' && esPeriodoActual && transcurridos.length && total > 0 ? promedio * diasMes : null

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Estadísticas</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tus gastos diarios</p>
      </div>

      <div className="grid grid-cols-3 p-1 rounded-2xl" style={{ background: 'var(--color-bg-secondary)' }}>
        {[['dia', 'Día'], ['mes', 'Mes'], ['anio', 'Año']].map(([id, label]) => (
          <button key={id} onClick={() => cambiarPeriodo(id)}
            className="py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
            style={{
              background: periodo === id ? 'var(--color-surface-elevated)' : 'transparent',
              color: periodo === id ? 'var(--color-text)' : 'var(--color-text-tertiary)',
              boxShadow: periodo === id ? '0 1px 4px rgba(0,0,0,0.08), inset 0 0 0 1px var(--color-border)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => mover(-1)} aria-label="Período anterior"
          className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer active:scale-90 transition-all"
          style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{etiquetaPeriodo(periodo, ref)}</span>
        <button onClick={() => mover(1)} aria-label="Período siguiente" disabled={esPeriodoActual}
          className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer active:scale-90 transition-all disabled:cursor-default"
          style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', opacity: esPeriodoActual ? 0.35 : 1 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <>
          <SkeletonCard lines={[50, 30]} />
          <SkeletonCard lines={[70, 40]} />
        </>
      ) : (
        <>
          <Card>
            <Titulo>Total gastado</Titulo>
            <p className="text-3xl font-extrabold tracking-tight tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(total)}</p>
            <Variacion actual={total} anterior={anterior} periodo={periodo} />
            {periodo !== 'dia' && total > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Promedio {periodo === 'mes' ? 'diario' : 'mensual'}
                  </p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(promedio)}</p>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    {periodo === 'mes' ? 'Día' : 'Mes'} con más gasto
                  </p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {pico >= 0 ? (periodo === 'mes' ? `${pico + 1} · ${fmt(serie[pico].valor)}` : `${mesesCortos[pico]} · ${fmt(serie[pico].valor)}`) : '—'}
                  </p>
                </div>
              </div>
            )}
            {periodo === 'dia' && promedioMesDia > 0 && (
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                Tu promedio diario este mes es <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{fmt(promedioMesDia)}</span>
              </p>
            )}
            {proyeccion != null && (
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                A este ritmo vas a cerrar el mes en <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{fmt(proyeccion)}</span>
              </p>
            )}
          </Card>

          {total === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>No hay gastos en este período</p>
            </Card>
          ) : (
            <>
              {periodo !== 'dia' && (
                <Card>
                  <Titulo>{periodo === 'mes' ? 'Gasto por día' : 'Gasto por mes'}</Titulo>
                  <GraficoBarras key={`${periodo}-${aStr(ref)}`} datos={serie} promedio={promedio}
                    etiquetaCada={periodo === 'mes' ? 5 : 1}
                    resaltar={periodo === 'mes' && esPeriodoActual ? hoy.getDate() - 1 : undefined} />
                </Card>
              )}

              {periodo !== 'dia' && (
                <Card>
                  <Titulo>Por día de la semana</Titulo>
                  <GraficoBarras key={`sem-${periodo}-${aStr(ref)}`} datos={porDiaSemana} />
                </Card>
              )}

              <Categorias gastos={gastos} categorias={categorias} />

              <Card>
                <Titulo>{periodo === 'dia' ? 'Gastos del día' : 'Gastos más grandes'}</Titulo>
                <div className="space-y-2.5">
                  {masGrandes.map((g) => (
                    <div key={g.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{g.concepto}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                          {getCat(g.categoriaId)}{periodo !== 'dia' && ` · ${desdeStr(g.fecha).getDate()}/${desdeStr(g.fecha).getMonth() + 1}`}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--color-negative)' }}>{fmt(g.monto)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Estadisticas
