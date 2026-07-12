import { useEffect, useState } from 'react'

function SplashScreen({ dbReady, onFinish }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    requestAnimationFrame(() => setPhase('idle'))
    const minDuration = new Promise(resolve => setTimeout(resolve, 1000))
    Promise.all([minDuration, dbReady]).then(() => {
      setPhase('exit')
      setTimeout(() => onFinish?.(), 500)
    })
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-500 ${
        phase === 'enter'
          ? 'opacity-0 scale-90'
          : phase === 'idle'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-125'
      }`}
      style={{ background: 'var(--color-bg)' }}
    >
      <img src="/zentro_logo.png" alt="Zentro" className="mb-4 w-24 h-24 object-contain" />
      <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        Controlá tu plata
      </p>
    </div>
  )
}

export default SplashScreen
