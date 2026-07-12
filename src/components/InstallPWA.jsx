import { useEffect, useState } from 'react'
import { Download, Info } from 'lucide-react'

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mediaQuery.matches)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  if (isInstalled) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') setDeferredPrompt(null)
    } else {
      setShowTip(true)
      setTimeout(() => setShowTip(false), 5000)
    }
  }

  return (
    <>
      {showTip && (
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg shadow-lg"
          style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          <Info size={12} />
          Menú del navegador &gt; Compartir &gt; Agregar a pantalla de inicio
        </div>
      )}
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer text-sm font-medium"
        style={{ background: 'var(--color-accent)' }}
      >
        <Download size={16} />
        Instalar app
      </button>
    </>
  )
}

export default InstallPWA
