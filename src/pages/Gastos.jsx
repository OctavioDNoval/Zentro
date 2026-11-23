import { useState, useEffect, useCallback } from 'react'
import { Tag, Search, X, TrendingDown } from 'lucide-react'
import db from '../db/index.js'
import { actualizarTotal } from '../db/estado-cuenta.js'
import { obtenerCotizacionBlue, convertirARS, formatearMonto, formatearARSCompacto } from '../db/moneda.js'
import GastoDiarioModal from '../components/GastoDiarioModal.jsx'
import GastoFijoModal from '../components/GastoFijoModal.jsx'
import GastoEditModal from '../components/GastoEditModal.jsx'
import GastoFijoEditModal from '../components/GastoFijoEditModal.jsx'
import CategoriaModal from '../components/CategoriaModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { EncabezadoPagina, ResumenMes, EncabezadoSeccion, BotonAgregar, EstadoVacio, ListaCard, SkeletonPagina } from '../components/Seccion.jsx'
import SwipeToDelete from '../components/SwipeToDelete.jsx'
import GrupoFecha, { FilaMovimiento, Chip } from '../components/GrupoFecha.jsx'
import IconoMovimiento from '../components/IconoMovimiento.jsx'
import { estiloTipo } from '../utils/iconos.js'
import { agruparPorFecha } from '../utils/fechas.js'
import { confirmarEliminar } from '../utils/confirmar.js'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const etiquetaTipo = { suscripcion: 'Suscripción', servicio: 'Servicio', cuotas: 'Cuotas' }

function Gastos() {
  const [data, setData] = useState({ gastosDiarios: [], gastosFijos: [], categorias: [] })
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalDiario, setModalDiario] = useState(false)
  const [modalFijo, setModalFijo] = useState(false)
  const [modalCategoria, setModalCategoria] = useState(false)
  const [editGasto, setEditGasto] = useState(null)
  const [editGastoFijo, setEditGastoFijo] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const hoy = new Date()
      const m = hoy.getMonth(); const y = hoy.getFullYear()
      const inicioStr = `${y}-${String(m + 1).padStart(2, '0')}-01`
      const finStr = m === 11 ? `${y + 1}-01-01` : `${y}-${String(m + 2).padStart(2, '0')}-01`
      const [gastosDiarios, gastosFijos, categorias, cot] = await Promise.all([
        db.gastos_diarios.where('fecha').between(inicioStr, finStr, true, false).reverse().toArray(),
        db.gastos_fijos.where('activo').equals(1).toArray(),
        db.categorias.toArray(),
        obtenerCotizacionBlue(),
      ])
      setData({ gastosDiarios, gastosFijos, categorias })
      setCotizacion(cot)
    } catch (err) {
      console.error('Error cargando gastos:', err)
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

  const getCat = (id) => data.categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría'

  const eliminarGasto = async (g) => {
    if (!(await confirmarEliminar({ tipo: 'gasto', nombre: g.concepto, monto: formatearARSCompacto(g.monto), detalle: 'El monto vuelve a tu total en mano.' }))) return
    const monto = Number(g.monto)
    await db.gastos_diarios.delete(g.id)
    if (Number.isFinite(monto) && monto > 0) await actualizarTotal(monto)
  }

  const gastosFiltrados = data.gastosDiarios.filter((g) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    const cat = getCat(g.categoriaId).toLowerCase()
    return g.concepto.toLowerCase().includes(q) || cat.includes(q)
  })

  const totalFiltrado = gastosFiltrados.reduce((s, g) => s + g.monto, 0)

  const totalGastosFijosARS = data.gastosFijos.reduce((s, g) => s + convertirARS(g.monto, g.moneda, cotizacion), 0)

  const totalDiarios = data.gastosDiarios.reduce((s, g) => s + g.monto, 0)
  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`

  if (loading) return <SkeletonPagina />

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EncabezadoPagina titulo="Gastos" subtitulo={mesActual} />

      <ResumenMes titulo="Gastos del mes" total={totalGastosFijosARS + totalDiarios}
        color="var(--color-negative)" colorSuave="var(--color-negative-light)" icon={TrendingDown}
        items={[{ label: 'Fijos', value: totalGastosFijosARS }, { label: 'Diarios', value: totalDiarios }]} />

      <section>
        <EncabezadoSeccion titulo="Gastos fijos">
          <BotonAgregar onClick={() => setModalFijo(true)} />
        </EncabezadoSeccion>
        {data.gastosFijos.length === 0 ? (
          <EstadoVacio>Sin gastos fijos cargados</EstadoVacio>
        ) : (
          <ListaCard>
            {data.gastosFijos.map((g) => {
              const { color } = estiloTipo(g.tipo)
              return (
                <FilaMovimiento key={g.id} onClick={() => setEditGastoFijo(g)}
                  icono={<IconoMovimiento tipo={g.tipo} />}
                  titulo={g.nombre}
                  subtitulo={
                    <div className="flex items-center gap-1.5">
                      <Chip color={color}>{etiquetaTipo[g.tipo] ?? 'Fijo'}</Chip>
                      {g.moneda === 'USD' && <Chip>USD</Chip>}
                    </div>
                  }
                  extra={g.tipo === 'cuotas' && g.total_cuotas > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((g.cuotas_pagadas / g.total_cuotas) * 100, 100)}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>{g.cuotas_pagadas}/{g.total_cuotas}</span>
                    </div>
                  )}
                  monto={<>−<AnimatedNumber value={g.monto} format={(v) => (g.moneda === 'USD' ? formatearMonto(v, 'USD') : formatearARSCompacto(v))} /></>}
                  color="var(--color-negative)" />
              )
            })}
          </ListaCard>
        )}
      </section>

      <section>
        <EncabezadoSeccion titulo="Gastos diarios">
          <BotonAgregar secundario icon={Tag} onClick={() => setModalCategoria(true)}>Categoría</BotonAgregar>
          <BotonAgregar onClick={() => setModalDiario(true)} />
        </EncabezadoSeccion>

        {data.gastosDiarios.length > 0 && (
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar por concepto o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm font-medium rounded-xl border outline-none transition-all duration-200"
              style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--color-text-tertiary)' }}>
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {busqueda && gastosFiltrados.length > 0 && (
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
              {gastosFiltrados.length} resultado{gastosFiltrados.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-negative)' }}>
              Total: <AnimatedNumber value={totalFiltrado} />
            </span>
          </div>
        )}

        {data.gastosDiarios.length === 0 ? (
          <EstadoVacio>Sin gastos este mes</EstadoVacio>
        ) : gastosFiltrados.length === 0 ? (
          <EstadoVacio>Sin resultados para "{busqueda}"</EstadoVacio>
        ) : (
          <div className="space-y-4">
            {agruparPorFecha(gastosFiltrados).map((grupo, gi) => (
              <GrupoFecha key={grupo.fecha} etiqueta={grupo.etiqueta} total={grupo.total} delay={gi * 0.05}>
                {grupo.items.map((g) => {
                  const cat = getCat(g.categoriaId)
                  return (
                    <SwipeToDelete key={g.id} rounded={false} onDelete={() => eliminarGasto(g)}>
                      <FilaMovimiento onClick={() => setEditGasto(g)}
                        icono={<IconoMovimiento categoria={cat} />}
                        titulo={g.concepto}
                        subtitulo={<span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{cat}</span>}
                        monto={<>−<AnimatedNumber value={g.monto} /></>}
                        color="var(--color-negative)" />
                    </SwipeToDelete>
                  )
                })}
              </GrupoFecha>
            ))}
          </div>
        )}
      </section>

      <GastoDiarioModal isOpen={modalDiario} onClose={() => setModalDiario(false)} onSaved={cargar} />
      <GastoFijoModal isOpen={modalFijo} onClose={() => setModalFijo(false)} onSaved={cargar} />
      <CategoriaModal isOpen={modalCategoria} onClose={() => setModalCategoria(false)} onSaved={cargar} />
      <GastoEditModal isOpen={!!editGasto} onClose={() => setEditGasto(null)} gasto={editGasto} onSaved={cargar} />
      <GastoFijoEditModal isOpen={!!editGastoFijo} onClose={() => setEditGastoFijo(null)} gasto={editGastoFijo} onSaved={cargar} />
    </div>
  )
}

export default Gastos
