import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, PiggyBank } from 'lucide-react'
import db from '../db/index.js'
import { CASAS, fetchCotizaciones, formatearUSD as formatUSD, formatearARSCompacto } from '../db/moneda.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import AhorroModal from '../components/AhorroModal.jsx'
import AhorroEditModal from '../components/AhorroEditModal.jsx'
import { EncabezadoPagina, ResumenMes, EncabezadoSeccion, BotonAgregar, EstadoVacio, ListaCard, SkeletonPagina } from '../components/Seccion.jsx'
import { FilaMovimiento, Chip } from '../components/GrupoFecha.jsx'
import IconoMovimiento from '../components/IconoMovimiento.jsx'
import SwipeToDelete from '../components/SwipeToDelete.jsx'
import { eliminarAhorro } from '../db/eliminar.js'

const NOMBRES_CASA = { blue: 'Blue', oficial: 'Oficial', mep: 'MEP', ccl: 'CCL' }

function formatearUltimaActualizacion(fechaStr) {
  if (!fechaStr) return null
  const ahora = Date.now()
  const diff = ahora - new Date(fechaStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace segundos'
  if (mins < 60) return `hace ${mins} min`
  const hs = Math.floor(mins / 60)
  return `hace ${hs}h ${mins % 60}m`
}

function Ahorros() {
  const [ahorros, setAhorros] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAhorro, setEditAhorro] = useState(null)
  const intervalRef = useRef(null)

  const blue = cotizaciones.find(c => c.casa === 'blue')

  const cargarAhorros = useCallback(async () => {
    try {
      const data = await db.ahorros.reverse().toArray()
      setAhorros(data)
    } catch (err) {
      console.error('Error cargando ahorros:', err)
    }
  }, [])

  const cargarCotizaciones = useCallback(async () => {
    setFetching(true)
    const data = await fetchCotizaciones()
    if (data) {
      setCotizaciones(data)
      const fechas = data.map(c => c.fechaActualizacion).filter(Boolean).sort()
      setLastUpdated(fechas[fechas.length - 1] || null)
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    Promise.all([cargarAhorros(), cargarCotizaciones()]).then(() => setLoading(false))
    intervalRef.current = setInterval(cargarCotizaciones, 300000)
    return () => clearInterval(intervalRef.current)
  }, [cargarAhorros, cargarCotizaciones])

  useEffect(() => {
    const handler = () => cargarAhorros()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargarAhorros])

  const totalARS = ahorros
    .filter(a => a.moneda === 'ARS')
    .reduce((s, a) => s + a.monto, 0)
  const totalUSD = ahorros
    .filter(a => a.moneda === 'USD')
    .reduce((s, a) => s + a.monto, 0)

  const totalEnARS = blue ? totalARS + totalUSD * blue.venta : totalARS
  const totalEnUSD = blue ? totalUSD + totalARS / blue.venta : totalUSD

  // Proporción pesos / dólares, medida en pesos
  const pctPesos = totalEnARS > 0 ? (totalARS / totalEnARS) * 100 : 0
  const formatUSDRedondo = (v) => 'USD ' + Math.round(v ?? 0).toLocaleString('es-AR')
  const precioBlue = blue ? '$' + Math.round(Number(blue.venta)).toLocaleString('es-AR') : null

  if (loading) return <SkeletonPagina />

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EncabezadoPagina titulo="Ahorros" subtitulo={precioBlue ? `Dólar blue a ${precioBlue}` : 'Tus ahorros'} />

      <ResumenMes titulo="Total ahorrado" total={totalEnARS}
        color="var(--color-accent)" colorSuave="var(--color-accent-light)" icon={PiggyBank}
        nota={blue && ahorros.length > 0 ? `≈ ${formatUSDRedondo(totalEnUSD)} al blue` : null}
        items={[
          { label: 'En pesos', value: totalARS },
          { label: 'En dólares', value: totalUSD, format: formatUSD },
        ]}>
        {blue && totalARS > 0 && totalUSD > 0 && (
          <div className="mt-3">
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
              <div className="rounded-full transition-all duration-700" style={{ width: `${pctPesos}%`, background: 'var(--color-accent)' }} />
              <div className="flex-1 rounded-full" style={{ background: 'var(--color-positive)' }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-semibold tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{Math.round(pctPesos)}% en pesos</span>
              <span>{100 - Math.round(pctPesos)}% en dólares</span>
            </div>
          </div>
        )}
      </ResumenMes>

      <section>
        <EncabezadoSeccion titulo="Dólar hoy">
          <BotonAgregar secundario icon={RefreshCw} onClick={cargarCotizaciones}>
            {fetching ? 'Actualizando…' : 'Actualizar'}
          </BotonAgregar>
        </EncabezadoSeccion>
        <div className="rounded-2xl border p-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-4 gap-2">
            {CASAS.map((casa) => {
              const c = cotizaciones.find((x) => x.casa === casa)
              const esBlue = casa === 'blue'
              return (
                <div key={casa} className="rounded-xl py-2.5 px-1 text-center"
                  style={{
                    background: esBlue ? 'var(--color-accent-light)' : 'var(--color-bg-secondary)',
                    boxShadow: esBlue ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 35%, transparent)' : 'none',
                  }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: esBlue ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}>{NOMBRES_CASA[casa]}</p>
                  <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--color-text)' }}>
                    {c ? '$' + Math.round(Number(c.venta)).toLocaleString('es-AR') : '–'}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] mt-2.5 px-1 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            Precio de venta{lastUpdated ? ` · actualizado ${formatearUltimaActualizacion(lastUpdated)}` : ''} · las conversiones usan el blue
          </p>
        </div>
      </section>

      <section>
        <EncabezadoSeccion titulo="Tus ahorros">
          <BotonAgregar onClick={() => setModalOpen(true)} />
        </EncabezadoSeccion>
        {ahorros.length === 0 ? (
          <EstadoVacio>Sin ahorros todavía</EstadoVacio>
        ) : (
          <ListaCard>
            {ahorros.map((a) => {
              const enUSD = a.moneda === 'USD'
              return (
                <SwipeToDelete key={a.id} rounded={false} onDelete={() => eliminarAhorro(a)}>
                  <FilaMovimiento onClick={() => setEditAhorro(a)}
                    icono={<IconoMovimiento tipo={enUSD ? 'ahorro_usd' : 'ahorro_ars'} />}
                    titulo={a.nombre}
                    subtitulo={
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Chip color={enUSD ? '#16a34a' : '#ea580c'}>{enUSD ? 'Dólares' : 'Pesos'}</Chip>
                        {a.descontadoDeTotal && <Chip>Del total</Chip>}
                        {enUSD && blue && (
                          <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
                            ≈ {formatearARSCompacto(Math.round(a.monto * blue.venta))}
                          </span>
                        )}
                      </div>
                    }
                    monto={<AnimatedNumber value={a.monto} format={enUSD ? formatUSD : formatearARSCompacto} />}
                    color="var(--color-text)" />
                </SwipeToDelete>
              )
            })}
          </ListaCard>
        )}
      </section>

      <AhorroModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={cargarAhorros} />
      <AhorroEditModal isOpen={!!editAhorro} onClose={() => setEditAhorro(null)} ahorro={editAhorro} onSaved={cargarAhorros} />
    </div>
  )
}

export default Ahorros
