import { useState, useEffect, useCallback } from 'react'
import { Plus, Tag, Pencil } from 'lucide-react'
import db from '../db/index.js'
import GastoDiarioModal from '../components/GastoDiarioModal.jsx'
import GastoFijoModal from '../components/GastoFijoModal.jsx'
import GastoEditModal from '../components/GastoEditModal.jsx'
import GastoFijoEditModal from '../components/GastoFijoEditModal.jsx'
import CategoriaModal from '../components/CategoriaModal.jsx'

function formatearMoneda(n) { return '$' + (n ?? 0).toLocaleString('es-AR') }
const formatearFecha = (s) => { if (!s) return ''; const [y, m, d] = s.split('T')[0].split('-'); return `${+d}/${+m}/${y}` }

const etiquetaTipo = { suscripcion: 'Suscripción', servicio: 'Servicio', cuotas: 'Cuotas' }
const colorTipo = { suscripcion: { bg: '#dbeafe', text: '#1d4ed8' }, servicio: { bg: '#fef3c7', text: '#b45309' }, cuotas: { bg: '#ede9fe', text: '#6d28d9' } }

function Gastos() {
  const [data, setData] = useState({ gastosDiarios: [], gastosFijos: [], categorias: [] })
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
      const [gastosDiarios, gastosFijos, categorias] = await Promise.all([
        db.gastos_diarios.where('fecha').between(inicioStr, finStr, true, false).reverse().toArray(),
        db.gastos_fijos.where('activo').equals(1).toArray(),
        db.categorias.toArray(),
      ])
      setData({ gastosDiarios, gastosFijos, categorias })
    } catch (err) {
      console.error('Error cargando gastos:', err)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const getCat = (id) => data.categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Gastos fijos</h3>
          <button onClick={() => setModalFijo(true)}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer"
            style={{ color: 'var(--color-accent)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.gastosFijos.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sin gastos fijos</p>
        ) : (
          <div className="space-y-2">
            {data.gastosFijos.map((g, i) => {
              const tc = colorTipo[g.tipo]
              return (
                <div key={g.id} className="rounded-lg px-3 py-2.5 border flex justify-between items-center animate-fade-in-up cursor-pointer hover:opacity-80 transition"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.05}s` }}
                  onClick={() => setEditGastoFijo(g)}>
                  <div className="flex items-center gap-2">
                    <Pencil size={12} className="shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{g.nombre}</p>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: tc.bg, color: tc.text }}>
                          {etiquetaTipo[g.tipo]}
                        </span>
                        {g.tipo === 'cuotas' && (
                          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                            {g.cuotas_pagadas}/{g.total_cuotas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-negative)' }}>{formatearMoneda(g.monto)}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Gastos del mes</h3>
          <div className="flex gap-2">
            <button onClick={() => setModalCategoria(true)}
              className="flex items-center gap-1 text-xs cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}>
              <Tag size={12} /> Categoría
            </button>
            <button onClick={() => setModalDiario(true)}
              className="flex items-center gap-1 text-xs font-medium cursor-pointer"
              style={{ color: 'var(--color-accent)' }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
        </div>
        {data.gastosDiarios.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sin gastos este mes</p>
        ) : (
          <div className="space-y-2">
            {data.gastosDiarios.map((g, i) => (
              <button key={g.id} onClick={() => setEditGasto(g)}
                className="w-full text-left rounded-lg px-3 py-2.5 border flex items-center gap-3 transition cursor-pointer hover:opacity-80 animate-fade-in-up"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', animationDelay: `${i * 0.05}s` }}>
                <Pencil size={14} className="shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{g.concepto}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {getCat(g.categoriaId)} · {formatearFecha(g.fecha)}
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-negative)' }}>{formatearMoneda(g.monto)}</span>
              </button>
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
