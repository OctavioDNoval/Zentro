import { useEffect, useState } from 'react'

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
      className="fixed bottom-4 right-4 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition cursor-pointer"
    >
      Instalar app
    </button>
  )
}

export default InstallPWA
