import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { createPortal } from 'react-dom'

function InstallModal() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return
    if (localStorage.getItem('hideInstallPrompt') === 'true') return

    const timer = setTimeout(() => setShow(true), 1000)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShow(false)
    }
  }

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideInstallPrompt', 'true')
    }
    setShow(false)
  }

  if (!show) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={handleClose}>
      <div
        className="relative max-w-sm w-full mx-5 rounded-2xl px-6 py-7 text-center"
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

        <div className="flex justify-center mb-4">
          <img src="/zentro_logo.png" alt="Zentro" className="w-20 h-20 object-contain" />
        </div>

        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Instalá Zentro
        </h2>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Accedé rápido desde tu pantalla de inicio y usalo sin conexión.
        </p>

        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer mb-4"
          style={{ background: 'var(--color-accent)' }}
        >
          <Download size={16} /> Instalar aplicación
        </button>

        {!deferredPrompt && (
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            También podés instalarlo desde el menú del navegador → Compartir → Agregar a pantalla de inicio
          </p>
        )}

        <label className="flex items-center justify-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
          />
          No volver a mostrar
        </label>
      </div>
    </div>,
    document.body
  )
}

export default InstallModal
