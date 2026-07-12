import { X } from 'lucide-react'

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-5 mx-4 my-8 max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
