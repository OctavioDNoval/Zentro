import { useState, useEffect, useCallback } from 'react'
import { Plus, Tag, Pencil } from 'lucide-react'
import db from '../db/index.js'
import GastoDiarioModal from '../components/GastoDiarioModal.jsx'
import GastoFijoModal from '../components/GastoFijoModal.jsx'
import GastoEditModal from '../components/GastoEditModal.jsx'
import GastoFijoEditModal from '../components/GastoFijoEditModal.jsx'
import CategoriaModal from '../components/CategoriaModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

const formatearFecha = (s) => { if (!s) return ''; const [y, m, d] = s.split('T')[0].split('-'); return `${+d}/${+m}/${y}` }

const etiquetaTipo = { suscripcion: 'Suscripción', servicio: 'Servicio', cuotas: 'Cuotas' }
const colorTipo = {
  suscripcion: { bg: '#1e3a5f', text: '#60a5fa', border: '#2563eb' },
  servicio: { bg: '#422006', text: '#fbbf24', border: '#d97706' },
  cuotas: { bg: '#2e1065', text: '#a78bfa', border: '#7c3aed' },
}

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

  useEffect(() => {
    const handler = () => cargar()
    window.addEventListener('zentro:data-changed', handler)
    return () => window.removeEventListener('zentro:data-changed', handler)
  }, [cargar])

  const getCat = (id) => data.categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>Gastos</h1>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Gastos fijos</h3>
          <button onClick={() => setModalFijo(true)}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
            style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {data.gastosFijos.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl px-4 py-2.5 mb-3 animate-fade-in-up"
            style={{ background: 'var(--color-negative-light)', border: '1px solid color-mix(in srgb, var(--color-negative) 20%, transparent)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total mensual</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-negative)' }}>
              <AnimatedNumber value={data.gastosFijos.reduce((s, g) => s + g.monto, 0)} />
              <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--color-text-tertiary)' }}>/mes</span>
            </span>
          </div>
        )}
        {data.gastosFijos.length === 0 ? (
          <div className="rounded-2xl border p-5 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Sin gastos fijos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.gastosFijos.map((g, i) => {
              const tc = colorTipo[g.tipo]
              return (
                <div key={g.id} className="card-base rounded-2xl px-4 py-3 flex justify-between items-center animate-fade-in-up cursor-pointer active:scale-[0.98]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setEditGastoFijo(g)}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'var(--color-negative-light)' }}>
                      <Pencil size={14} style={{ color: 'var(--color-negative)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{g.nombre}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                          style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}30` }}>
                          {etiquetaTipo[g.tipo]}
                        </span>
                        {g.tipo === 'cuotas' && (
                          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                            {g.cuotas_pagadas}/{g.total_cuotas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-negative)' }}><AnimatedNumber value={g.monto} /></span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Gastos del mes</h3>
          <div className="flex gap-2">
            <button onClick={() => setModalCategoria(true)}
              className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)' }}>
              <Tag size={12} /> Categoría
            </button>
            <button onClick={() => setModalDiario(true)}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
              style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
        </div>
        {data.gastosDiarios.length === 0 ? (
          <div className="rounded-2xl border p-5 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Sin gastos este mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.gastosDiarios.map((g, i) => (
              <button key={g.id} onClick={() => setEditGasto(g)}
                className="w-full text-left card-base rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200 cursor-pointer active:scale-[0.98] animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0" style={{ background: 'var(--color-negative-light)' }}>
                  <Pencil size={14} style={{ color: 'var(--color-negative)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{g.concepto}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    {getCat(g.categoriaId)} · {formatearFecha(g.fecha)}
                  </p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: 'var(--color-negative)' }}><AnimatedNumber value={g.monto} /></span>
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
