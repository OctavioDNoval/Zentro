import { Plus } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber.jsx'
import { SkeletonCard } from './Skeleton.jsx'

// Piezas compartidas por las páginas de Gastos e Ingresos para que se vean iguales

export function EncabezadoPagina({ titulo, subtitulo }) {
  return (
    <div className="text-center pt-2">
      <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>{titulo}</h1>
      {subtitulo && <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{subtitulo}</p>}
    </div>
  )
}

// Tarjeta de resumen: total grande + desglose en dos recuadros
export function ResumenMes({ titulo, total, color, colorSuave, icon: Icon, items, format, nota, children }) {
  return (
    <div className="rounded-2xl p-4 border animate-scale-in" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{titulo}</span>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: colorSuave }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums" style={{ color }}>
        <AnimatedNumber value={total} format={format} />
      </p>
      {nota && <p className="mt-1 text-xs font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>{nota}</p>}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-secondary)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}><AnimatedNumber value={item.value} format={item.format} /></p>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export function BotonAgregar({ onClick, children = 'Agregar', icon: Icon = Plus, secundario = false }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
      style={secundario
        ? { color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)' }
        : { color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
      <Icon size={secundario ? 12 : 14} /> {children}
    </button>
  )
}

export function EncabezadoSeccion({ titulo, children }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{titulo}</h3>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function EstadoVacio({ children }) {
  return (
    <div className="rounded-2xl border p-5 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{children}</p>
    </div>
  )
}

// Card continua con filas separadas por una línea fina
export function ListaCard({ children }) {
  return (
    <div className="rounded-2xl border overflow-hidden animate-fade-in-up [&>*+*]:border-t [&>*+*]:border-[var(--color-border-subtle)]"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {children}
    </div>
  )
}

export function SkeletonPagina() {
  const shimmer = { background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center pt-2 space-y-2">
        <div className="h-7 w-28 mx-auto rounded-lg" style={shimmer} />
        <div className="h-4 w-36 mx-auto rounded-lg" style={shimmer} />
      </div>
      <div className="h-36 rounded-2xl" style={shimmer} />
      <SkeletonCard lines={[70, 40]} />
      <SkeletonCard lines={[60, 35]} />
    </div>
  )
}
