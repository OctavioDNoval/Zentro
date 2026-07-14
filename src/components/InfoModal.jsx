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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
      <div
        className="relative max-w-sm w-full mx-5 rounded-2xl px-6 py-7"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 cursor-pointer transition-all duration-150 active:scale-90"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X size={20} />
        </button>

        <div key={step} className="flex flex-col items-center text-center min-h-[200px] justify-center animate-fade-in-up">
          <div className="mb-5 p-4 rounded-full" style={{ background: 'var(--color-accent-light)' }}>
            <Icon size={36} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
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
              className="flex items-center gap-1 text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
          ) : (
            <div />
          )}

          {step < total - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95"
              style={{ color: 'var(--color-accent)' }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95"
              style={{ color: 'var(--color-accent)' }}
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
