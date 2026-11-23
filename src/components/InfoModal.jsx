import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  X, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Wallet, TrendingUp, CreditCard, PiggyBank,
  PieChart, Calendar, Hand, ShieldCheck,
} from 'lucide-react'

// Guía de uso. Mantener al día cuando cambie cómo funciona la app.
const pasos = [
  {
    icon: Sparkles, color: '#ea580c',
    titulo: 'Bienvenido a Zentro',
    puntos: [
      'Controlá ingresos, gastos y ahorros en un solo lugar.',
      'Funciona sin conexión: tus datos quedan guardados en este dispositivo.',
      'Usá la barra de abajo o deslizá la pantalla para moverte entre secciones.',
      'El botón + del centro carga un gasto rápido desde cualquier pantalla.',
    ],
  },
  {
    icon: Wallet, color: '#ea580c', path: '/', seccion: 'Plantilla',
    titulo: 'Total en mano',
    puntos: [
      'Es la plata que tenés disponible ahora. Está en la Plantilla, la pantalla de inicio.',
      'Se actualiza al instante con cada ingreso, gasto o ahorro que cargues o borres.',
      'Tocá el ojo para ocultar los montos si estás con alguien.',
      'Si gastás más del 80% de tus ingresos del mes, te avisamos.',
    ],
  },
  {
    icon: TrendingUp, color: '#16a34a', path: '/ingresos', seccion: 'Ingresos',
    titulo: 'Ingresos',
    puntos: [
      'Fijos (sueldo, mesada): se suman solos a tu total al empezar cada mes.',
      'Al cargar uno nuevo podés elegir sumarlo ya este mes.',
      'Variables (freelance, ventas): se suman al instante y se agrupan por día.',
    ],
  },
  {
    icon: CreditCard, color: '#dc2626', path: '/gastos', seccion: 'Gastos',
    titulo: 'Gastos',
    puntos: [
      'Diarios: cargalos con una categoría y se descuentan al instante. Podés buscarlos por nombre o categoría.',
      'Fijos: suscripciones, servicios y cuotas, en pesos o dólares (se convierten al blue).',
      'Los fijos se descuentan solos al empezar cada mes. Las cuotas avanzan y se terminan solas.',
    ],
  },
  {
    icon: PiggyBank, color: '#ea580c', path: '/ahorros', seccion: 'Ahorros',
    titulo: 'Ahorros',
    puntos: [
      'Guardá ahorros en pesos o en dólares y mirá el total convertido al blue.',
      'Si marcás "Descontar del total en mano", el ahorro sale de tu disponible.',
      'Las cotizaciones (blue, oficial, MEP y CCL) se actualizan cada 5 minutos.',
    ],
  },
  {
    icon: PieChart, color: '#7c3aed', path: '/estadisticas', seccion: 'Estadísticas',
    titulo: 'Estadísticas',
    puntos: [
      'Mirá tus gastos diarios por día, mes o año.',
      'Gráfico de cuánto gastaste cada día, por categoría y por día de la semana.',
      'Comparación con el período anterior y una proyección de cómo cerrás el mes.',
    ],
  },
  {
    icon: Calendar, color: '#2563eb', path: '/dashboard', seccion: 'Dashboard',
    titulo: 'Dashboard y cierre de mes',
    puntos: [
      'En el Dashboard ves el balance del mes en curso en vivo, tu evolución y los meses cerrados.',
      'El balance es solo un cálculo (ingresos − gastos): nunca cambia tu total en mano.',
      'Al empezar un mes nuevo se guarda el reporte del anterior, se suman los ingresos fijos, se descuentan los gastos fijos y avanzan las cuotas.',
      'Los gastos del mes arrancan de cero; los anteriores siguen en Estadísticas.',
    ],
  },
  {
    icon: Hand, color: '#0891b2',
    titulo: 'Gestos',
    puntos: [
      'Deslizá la pantalla a los costados para cambiar de sección.',
      'Deslizá un movimiento hacia la izquierda para borrarlo. Siempre te pedimos confirmar.',
      'Tocá cualquier movimiento para editarlo.',
    ],
  },
  {
    icon: ShieldCheck, color: '#16a34a',
    titulo: 'Tus datos',
    puntos: [
      'Desde el engranaje ⚙️ podés exportar un respaldo e importarlo en otro dispositivo.',
      'También podés cambiar entre modo claro y oscuro.',
      'Podés instalar Zentro en tu celular para abrirla como una app más.',
    ],
  },
]

function InfoModal({ isOpen, onClose }) {
  const [paso, setPaso] = useState(0)
  const carrusel = useRef(null)
  const navigate = useNavigate()
  const total = pasos.length

  const irA = (i) => {
    const el = carrusel.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setPaso(i)
  }

  const onScroll = () => {
    const el = carrusel.current
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== paso) setPaso(i)
  }

  const cerrar = () => {
    setPaso(0)
    onClose()
  }

  const irASeccion = (path) => {
    cerrar()
    navigate(path)
  }

  if (!isOpen) return null
  const actual = pasos[paso]

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={cerrar}>
      <div role="dialog" aria-modal="true" aria-label="Cómo usar Zentro"
        className="relative w-full max-w-sm rounded-3xl py-6 animate-scale-in"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider tabular-nums" style={{ color: 'var(--color-text-tertiary)' }}>
            Cómo usar Zentro · {paso + 1}/{total}
          </span>
          <button onClick={cerrar} aria-label="Cerrar"
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
            style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Pasos deslizables, igual que las pestañas de la app */}
        <div ref={carrusel} onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ overscrollBehaviorX: 'contain' }}>
          {pasos.map((p, i) => {
            const Icon = p.icon
            return (
              <section key={p.titulo} aria-hidden={i !== paso}
                className="w-full shrink-0 snap-start [scroll-snap-stop:always] px-6 min-h-[340px]">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{ background: `color-mix(in srgb, ${p.color} 14%, transparent)` }}>
                  <Icon size={26} style={{ color: p.color }} />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--color-text)' }}>{p.titulo}</h2>
                <ul className="space-y-2.5">
                  {p.puntos.map((texto) => (
                    <li key={texto} className="flex gap-2.5 text-sm leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
                      <span>{texto}</span>
                    </li>
                  ))}
                </ul>
                {p.path && (
                  <button onClick={() => irASeccion(p.path)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
                    style={{ color: p.color, background: `color-mix(in srgb, ${p.color} 12%, transparent)` }}>
                    Ir a {p.seccion} <ArrowRight size={13} />
                  </button>
                )}
              </section>
            )
          })}
        </div>

        <div className="flex justify-center gap-1.5 my-5">
          {pasos.map((p, i) => (
            <button key={p.titulo} onClick={() => irA(i)} aria-label={`Paso ${i + 1}: ${p.titulo}`}
              className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              style={{ background: i === paso ? actual.color : 'var(--color-border)', width: i === paso ? 22 : 6 }} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 px-6">
          <button onClick={() => irA(paso - 1)} disabled={paso === 0}
            className="flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:cursor-default disabled:opacity-40"
            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
            <ChevronLeft size={16} /> Anterior
          </button>
          {paso < total - 1 ? (
            <button onClick={() => irA(paso + 1)}
              className="flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98]"
              style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}>
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={cerrar}
              className="btn-primary rounded-xl py-2.5 text-sm font-semibold cursor-pointer">
              ¡Empezar!
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default InfoModal
