function Skeleton({ className = '', count = 1, style }) {
  return (
    <div className={className} style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl"
          style={{
            background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            height: '100%',
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ lines = [60, 40] }) {
  return (
    <div className="rounded-2xl p-4 border space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl" style={{ background: 'var(--color-bg-secondary)', animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)' }} />
        <div className="flex-1 space-y-2">
          {lines.map((w, i) => (
            <div key={i} className="h-3 rounded-lg" style={{ width: `${w}%`, background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div className="w-16 h-4 rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="text-center pt-2 space-y-2">
        <div className="h-7 w-32 mx-auto rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        <div className="h-4 w-24 mx-auto rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
      </div>
      <div className="rounded-2xl p-5 border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between">
          <div className="h-4 w-28 rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          <div className="h-5 w-16 rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          <div className="h-3 w-3/4 rounded-lg" style={{ background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      {[1, 2].map(i => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default Skeleton
