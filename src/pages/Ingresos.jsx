import { useState, useEffect, useCallback } from 'react'
import { TrendingUp } from 'lucide-react'
import db from '../db/index.js'
import { calcularReporte } from '../db/ciclo-mensual.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'
import IngresoFijoEditModal from '../components/IngresoFijoEditModal.jsx'
import IngresoEfimeroEditModal from '../components/IngresoEfimeroEditModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { EncabezadoPagina, ResumenMes, EncabezadoSeccion, BotonAgregar, EstadoVacio, ListaCard, SkeletonPagina } from '../components/Seccion.jsx'
import SwipeToDelete from '../components/SwipeToDelete.jsx'
import { eliminarIngresoEfimero, eliminarIngresoFijo } from '../db/eliminar.js'
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
      const mes = inicioStr.slice(0, 7)
      const [ingresosFijos, ingresosEfimeros, reporte] = await Promise.all([
        db.ingresos_fijos.where('activo').equals(1).toArray(),
        db.ingresos_efimeros.where('fecha').between(inicioStr, finStr, true, false).reverse().toArray(),
        calcularReporte(mes),
      ])
      setData({ ingresosFijos, ingresosEfimeros, mes, totalFijos: reporte.total_ingresos_fijos, totalVariables: reporte.total_ingresos_efimeros })
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
  // Mismo cálculo que el Dashboard: solo cuenta los fijos que ya se sumaron este mes
  const totalFijos = data.totalFijos ?? 0
  const totalEfimeros = data.totalVariables ?? 0

  if (loading) return <SkeletonPagina />

  return (
    <div className="space-y-6 animate-fade-in-up">
      <EncabezadoPagina titulo="Ingresos" subtitulo={mesActual} />

      <ResumenMes titulo="Ingresos del mes" total={totalFijos + totalEfimeros}
        color="var(--color-positive)" colorSuave="var(--color-positive-light)" icon={TrendingUp}
        items={[{ label: 'Fijos', value: totalFijos }, { label: 'Variables', value: totalEfimeros }]} />

      <section>
        <EncabezadoSeccion titulo="Ingresos fijos">
          <BotonAgregar onClick={() => setModalFijo(true)} />
        </EncabezadoSeccion>
        {data.ingresosFijos.length === 0 ? (
          <EstadoVacio>Sin ingresos fijos cargados</EstadoVacio>
        ) : (
          <ListaCard>
            {data.ingresosFijos.map((ing) => (
              <SwipeToDelete key={ing.id} rounded={false} onDelete={() => eliminarIngresoFijo(ing)}>
                <FilaMovimiento onClick={() => setEditFijo(ing)}
                  icono={<IconoMovimiento tipo="sueldo" />}
                  titulo={ing.nombre}
                  subtitulo={
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Chip color="#16a34a">Cobra el día {ing.dia_cobro}</Chip>
                      {ing.mes_aplicado !== data.mes && <Chip>Pendiente: se suma el 1° del mes que viene</Chip>}
                    </div>
                  }
                  monto={<>+<AnimatedNumber value={ing.monto} /></>}
                  color="var(--color-positive)" />
              </SwipeToDelete>
            ))}
          </ListaCard>
        )}
      </section>

      <section>
        <EncabezadoSeccion titulo="Ingresos variables">
          <BotonAgregar onClick={() => setModalEfimero(true)} />
        </EncabezadoSeccion>
        {data.ingresosEfimeros.length === 0 ? (
          <EstadoVacio>Sin ingresos este mes</EstadoVacio>
        ) : (
          <div className="space-y-4">
            {agruparPorFecha(data.ingresosEfimeros).map((grupo, gi) => (
              <GrupoFecha key={grupo.fecha} etiqueta={grupo.etiqueta} total={grupo.total} delay={gi * 0.05}>
                {grupo.items.map((ing) => (
                  <SwipeToDelete key={ing.id} rounded={false} onDelete={() => eliminarIngresoEfimero(ing)}>
                    <FilaMovimiento onClick={() => setEditEfimero(ing)}
                      icono={<IconoMovimiento tipo="ingreso" />}
                      titulo={ing.nombre}
                      monto={<>+<AnimatedNumber value={ing.monto} /></>}
                      color="var(--color-positive)" />
                  </SwipeToDelete>
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
