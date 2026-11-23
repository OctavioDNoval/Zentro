import AnimatedNumber from './AnimatedNumber.jsx'

// Encabezado del día con subtotal y los movimientos dentro de una misma card
function GrupoFecha({ etiqueta, total, children, delay = 0 }) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-baseline justify-between px-1 mb-1.5">
        <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>{etiqueta}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
          <AnimatedNumber value={total} />
        </span>
      </div>
      <div className="rounded-2xl border overflow-hidden [&>*+*]:border-t [&>*+*]:border-[var(--color-border-subtle)]"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        {children}
      </div>
    </div>
  )
}

export function FilaMovimiento({ icono, titulo, subtitulo, monto, color, onClick, extra }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] active:bg-[var(--color-bg-secondary)]"
      style={{ background: 'var(--color-surface)' }}>
      {icono}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{titulo}</p>
        {subtitulo && <div className="mt-0.5">{subtitulo}</div>}
        {extra}
      </div>
      <span className="text-sm font-bold tabular-nums shrink-0" style={{ color }}>{monto}</span>
    </button>
  )
}

export function Chip({ children, color }) {
  return (
    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
      style={color
        ? { background: `color-mix(in srgb, ${color} 12%, transparent)`, color }
        : { background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
      {children}
    </span>
  )
}

export default GrupoFecha
