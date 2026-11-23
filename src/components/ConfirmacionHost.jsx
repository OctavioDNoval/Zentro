import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, AlertTriangle } from 'lucide-react'
import { registrarConfirmacion } from '../utils/confirmar.js'

// Diálogo de confirmación único para toda la app. Se monta una sola vez y se
// abre con confirmar()/confirmarEliminar() desde cualquier lado.
function ConfirmacionHost() {
  const [pedido, setPedido] = useState(null)
  const botonCancelar = useRef(null)

  useEffect(() => registrarConfirmacion(setPedido), [])

  const responder = useCallback((valor) => {
    setPedido((actual) => { actual?.resolve(valor); return null })
  }, [])

  useEffect(() => {
    if (!pedido) return
    botonCancelar.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') responder(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pedido, responder])

  if (!pedido) return null

  const Icon = pedido.peligro ? Trash2 : AlertTriangle
  const color = pedido.peligro ? 'var(--color-negative)' : 'var(--color-accent)'

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={() => responder(false)}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirmacion-titulo"
        className="w-full max-w-sm rounded-3xl p-6 animate-scale-in text-center"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <h2 id="confirmacion-titulo" className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{pedido.titulo}</h2>

        {(pedido.nombre || pedido.monto) && (
          <div className="mt-3 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 text-left" style={{ background: 'var(--color-bg-secondary)' }}>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{pedido.nombre}</span>
            {pedido.monto && <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--color-text)' }}>{pedido.monto}</span>}
          </div>
        )}

        {pedido.detalle && <p className="mt-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{pedido.detalle}</p>}
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Esta acción no se puede deshacer.</p>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button ref={botonCancelar} onClick={() => responder(false)}
            className="rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
            Cancelar
          </button>
          <button onClick={() => responder(true)}
            className="rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            style={{ background: color, color: '#fff' }}>
            {pedido.textoConfirmar ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmacionHost
