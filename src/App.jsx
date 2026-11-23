import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import ConfirmacionHost from './components/ConfirmacionHost.jsx'
import { useCierreMensual } from './hooks/useCierreMensual.js'

function App({ dbReady }) {
  const [showSplash, setShowSplash] = useState(true)
  useCierreMensual()

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  if (showSplash) return <SplashScreen dbReady={dbReady} onFinish={() => setShowSplash(false)} />

  return (
    <>
      <Routes>
        {/* Las páginas las dibuja el carrusel de Layout; las rutas solo definen la URL */}
        <Route element={<Layout />}>
          <Route index />
          <Route path="gastos" />
          <Route path="dashboard" />
          <Route path="ahorros" />
          <Route path="ingresos" />
          <Route path="estadisticas" />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ConfirmacionHost />
    </>
  )
}

export default App
