import { useState, useEffect, useCallback } from 'react'
import db from '../db/index.js'
import GastoDiarioModal from '../components/GastoDiarioModal.jsx'
import GastoFijoModal from '../components/GastoFijoModal.jsx'
import GastoEditModal from '../components/GastoEditModal.jsx'
import CategoriaModal from '../components/CategoriaModal.jsx'

function formatearMoneda(n) {
  return '$' + (n ?? 0).toLocaleString('es-AR')
}

const etiquetaTipo = { suscripcion: 'Suscripción', servicio: 'Servicio', cuotas: 'Cuotas' }
const colorTipo = { suscripcion: 'bg-blue-100 text-blue-700', servicio: 'bg-amber-100 text-amber-700', cuotas: 'bg-purple-100 text-purple-700' }

function Gastos() {
  const [data, setData] = useState({ gastosDiarios: [], gastosFijos: [], categorias: [] })
  const [modalDiario, setModalDiario] = useState(false)
  const [modalFijo, setModalFijo] = useState(false)
  const [modalCategoria, setModalCategoria] = useState(false)
  const [editGasto, setEditGasto] = useState(null)

  const cargar = useCallback(async () => {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)

    const [gastosDiarios, gastosFijos, categorias] = await Promise.all([
      db.gastos_diarios.where('fecha').between(inicioMes, finMes).reverse().toArray(),
      db.gastos_fijos.where({ activo: true }).toArray(),
      db.categorias.toArray(),
    ])

    setData({ gastosDiarios, gastosFijos, categorias })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const getCategoriaNombre = (id) => data.categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría'

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Gastos del mes</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setModalCategoria(true)}
              className="text-gray-400 text-xs hover:text-gray-600 cursor-pointer"
            >
              + Categoría
            </button>
            <button
              onClick={() => setModalDiario(true)}
              className="text-indigo-600 text-xs font-medium hover:text-indigo-800 cursor-pointer"
            >
              + Agregar
            </button>
          </div>
        </div>

        {data.gastosDiarios.length === 0 ? (
          <p className="text-xs text-gray-400">Sin gastos este mes</p>
        ) : (
          <div className="space-y-2">
            {data.gastosDiarios.map((g) => (
              <button
                key={g.id}
                onClick={() => setEditGasto(g)}
                className="w-full text-left bg-white rounded-lg px-3 py-2.5 border border-gray-100 flex justify-between items-center hover:border-gray-200 transition cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{g.concepto}</p>
                  <p className="text-xs text-gray-400">
                    {getCategoriaNombre(g.categoriaId)} · {new Date(g.fecha).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-rose-500 ml-3">{formatearMoneda(g.monto)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Gastos fijos</h3>
          <button
            onClick={() => setModalFijo(true)}
            className="text-indigo-600 text-xs font-medium hover:text-indigo-800 cursor-pointer"
          >
            + Agregar
          </button>
        </div>
        {data.gastosFijos.length === 0 ? (
          <p className="text-xs text-gray-400">Sin gastos fijos</p>
        ) : (
          <div className="space-y-2">
            {data.gastosFijos.map((g) => (
              <div key={g.id} className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{g.nombre}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colorTipo[g.tipo]}`}>
                      {etiquetaTipo[g.tipo]}
                    </span>
                    {g.tipo === 'cuotas' && (
                      <span className="text-[10px] text-gray-400">
                        {g.cuotas_pagadas}/{g.total_cuotas}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-rose-500">{formatearMoneda(g.monto)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <GastoDiarioModal isOpen={modalDiario} onClose={() => setModalDiario(false)} onSaved={cargar} />
      <GastoFijoModal isOpen={modalFijo} onClose={() => setModalFijo(false)} onSaved={cargar} />
      <CategoriaModal isOpen={modalCategoria} onClose={() => setModalCategoria(false)} onSaved={cargar} />
      <GastoEditModal isOpen={!!editGasto} onClose={() => setEditGasto(null)} gasto={editGasto} onSaved={cargar} />
    </div>
  )
}

export default Gastos
