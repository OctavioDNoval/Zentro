import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Wallet, CreditCard, Calendar, BarChart3, DollarSign, Sparkles } from 'lucide-react'

const steps = [
  {
    icon: Sparkles,
    title: 'Bienvenido a Zentro',
    description: 'Controlá tus ingresos y gastos en un solo lugar. Todo funciona sin conexión y tus datos quedan guardados en el dispositivo.',
  },
  {
    icon: DollarSign,
    title: 'Ingresos',
    description: 'Cargá tus ingresos fijos (sueldo, mesada) para que se sumen automáticamente cada mes. Los ingresos efímeros (freelance, ventas) se agregan al instante.',
  },
  {
    icon: CreditCard,
    title: 'Gastos Fijos',
    description: 'Suscripciones, servicios y cuotas. Si cargás un gasto en cuotas, se descuenta solo mes a mes hasta completarlas. No te olvidás de pagar ninguna.',
  },
  {
    icon: Wallet,
    title: 'Gastos Diarios',
    description: 'Registrá todos tus gastos del día con categorías (comida, transporte, etc.). Se descuentan al instante de tu disponible para que siempre sepas cuánto tenés.',
  },
  {
    icon: Calendar,
    title: 'Ciclo Mensual',
    description: 'El 1° de cada mes hacemos un cierre automático: guardamos un resumen, reiniciamos los gastos diarios y avanzan las cuotas. Todo sin que tengas que hacer nada.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Historial completo de todos los cierres mensuales. Seguí tu evolución financiera, compará meses y mantenete al tanto de tus finanzas.',
  },
]

function InfoModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const total = steps.length
  const current = steps[step]
  const Icon = current.icon

  const handleClose = () => {
    setStep(0)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={handleClose}>
      <div
        className="relative max-w-sm w-full mx-5 rounded-3xl px-6 py-7 animate-scale-in"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
          style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)' }}
        >
          <X size={16} />
        </button>

        <div key={step} className="flex flex-col items-center text-center min-h-[200px] justify-center animate-fade-in-up">
          <div className="mb-5 p-4 rounded-2xl" style={{ background: 'var(--color-accent-glow)' }}>
            <Icon size={36} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-lg font-bold tracking-tight mb-2" style={{ color: 'var(--color-text)' }}>
            {current.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {current.description}
          </p>
        </div>

        <div className="flex justify-center gap-1.5 my-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
                width: i === step ? 24 : 6,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
          ) : (
            <div />
          )}

          {step < total - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
              style={{ color: 'var(--color-accent)', background: 'var(--color-accent-glow)' }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-sm font-semibold cursor-pointer transition-all duration-200 active:scale-95 px-3 py-1.5 rounded-xl"
              style={{ color: '#fff', background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 80%, #ea580c) 100%)' }}
            >
              ¡Empezar!
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default InfoModal
