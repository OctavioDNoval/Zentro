import { formatearARSCompacto } from '../db/moneda.js'

function SugerenciasMonto({ sugerencias, onSelect }) {
  if (!sugerencias || sugerencias.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
        Montos usados
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sugerencias.map((sugerencia, i) => (
          <div key={sugerencia.monto} className="shrink-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
            <button
              type="button"
              onClick={() => onSelect(sugerencia.monto)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
              style={{
                background: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label={`Usar monto ${formatearARSCompacto(sugerencia.monto)}`}
            >
              {formatearARSCompacto(sugerencia.monto)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SugerenciasMonto
