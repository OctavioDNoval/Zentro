import { useState, useEffect, useCallback } from 'react'
import db from '../db/index.js'
import IngresoFijoModal from '../components/IngresoFijoModal.jsx'
import IngresoEfimeroModal from '../components/IngresoEfimeroModal.jsx'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

function Plantilla() {
  const [data, setData] = useState({ ingresosFijos: [], ingresosEfimeros: [], gastadoMes: 0, totalEnMano: 0 })
  const [modalIngresoFijo, setModalIngresoFijo] = useState(false)
  const [modalIngresoEfimero, setModalIngresoEfimero] = useState(false)

  const cargar = useCallback(async () => {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)

    const [ingresosFijos, ingresosEfimeros, gastosDiarios, estado] = await Promise.all([
      db.ingresos_fijos.where({ activo: true }).toArray(),
      db.ingresos_efimeros.where('fecha').between(inicioMes, finMes).toArray(),
      db.gastos_diarios.where('fecha').between(inicioMes, finMes).toArray(),
      db.estado_cuenta.get(1),
    ])

    const gastadoMes = gastosDiarios.reduce((s, g) => s + g.monto, 0)
    const totalSueldos = ingresosFijos.reduce((s, i) => s + i.monto, 0)

    setData({
      ingresosFijos,
      ingresosEfimeros,
      gastadoMes,
      restanteMes: totalSueldos - gastadoMes,
      totalEnMano: estado?.total_en_mano ?? 0,
      totalSueldos,
    })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">{mesActual}</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Gastado</p>
          <p className="text-sm font-bold text-rose-500">{formatearMoneda(data.gastadoMes)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Restante</p>
          <p className={`text-sm font-bold ${(data.restanteMes ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatearMoneda(data.restanteMes)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-sm font-bold text-indigo-600">{formatearMoneda(data.totalEnMano)}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Ingresos fijos</h3>
          <button
            onClick={() => setModalIngresoFijo(true)}
            className="text-indigo-600 text-xs font-medium hover:text-indigo-800 cursor-pointer"
          >
            + Agregar
          </button>
        </div>
        {data.ingresosFijos.length === 0 ? (
          <p className="text-xs text-gray-400">Sin ingresos fijos cargados</p>
        ) : (
          <div className="space-y-2">
            {data.ingresosFijos.map((ing) => (
              <div key={ing.id} className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{ing.nombre}</p>
                  <p className="text-xs text-gray-400">Día {ing.dia_cobro}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">{formatearMoneda(ing.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Ingresos</h3>
          <button
            onClick={() => setModalIngresoEfimero(true)}
            className="text-indigo-600 text-xs font-medium hover:text-indigo-800 cursor-pointer"
          >
            + Agregar
          </button>
        </div>
        {data.ingresosEfimeros.length === 0 ? (
          <p className="text-xs text-gray-400">Sin ingresos este mes</p>
        ) : (
          <div className="space-y-2">
            {data.ingresosEfimeros.map((ing) => (
              <div key={ing.id} className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{ing.nombre}</p>
                  <p className="text-xs text-gray-400">{new Date(ing.fecha).toLocaleDateString('es-AR')}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">{formatearMoneda(ing.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <IngresoFijoModal isOpen={modalIngresoFijo} onClose={() => setModalIngresoFijo(false)} onSaved={cargar} />
      <IngresoEfimeroModal isOpen={modalIngresoEfimero} onClose={() => setModalIngresoEfimero(false)} onSaved={cargar} />
    </div>
  )
}

export default Plantilla
