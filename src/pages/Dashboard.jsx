import { useState, useEffect, useCallback } from 'react'
import db from '../db/index.js'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

function formatearMes(mesStr) {
  const [y, m] = mesStr.split('-')
  return `${meses[Number(m) - 1]} ${y}`
}

function Dashboard() {
  const [resumenes, setResumenes] = useState([])

  const cargar = useCallback(async () => {
    const data = await db.resumen_mensual
      .orderBy('mes')
      .reverse()
      .toArray()
    setResumenes(data)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Historial mensual</h2>

      {resumenes.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no hay cierres de mes</p>
      ) : (
        <div className="space-y-3">
          {resumenes.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{formatearMes(r.mes)}</h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ingresos fijos</span>
                  <span className="font-medium text-emerald-600">{formatearMoneda(r.total_ingresos_fijos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ingresos</span>
                  <span className="font-medium text-emerald-600">{formatearMoneda(r.total_ingresos_efimeros)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gastos fijos</span>
                  <span className="font-medium text-rose-500">{formatearMoneda(r.total_gastos_fijos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gastos diarios</span>
                  <span className="font-medium text-rose-500">{formatearMoneda(r.total_gastos_diarios)}</span>
                </div>
              </div>

              <hr className="my-2 border-gray-100" />

              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-600">Total en mano</span>
                <span className={r.total_en_mano >= 0 ? 'text-indigo-600' : 'text-rose-600'}>
                  {formatearMoneda(r.total_en_mano)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
