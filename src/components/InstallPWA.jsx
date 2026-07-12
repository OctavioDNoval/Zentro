import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mediaQuery.matches)
    mediaQuery.addEventListener('change', (e) => setIsInstalled(e.matches))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  if (isInstalled || !deferredPrompt) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer text-sm font-medium z-20"
      style={{ background: 'var(--color-accent)' }}
    >
      <Download size={16} />
      Instalar app
    </button>
  )
}

export default InstallPWA
