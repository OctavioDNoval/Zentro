import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Plantilla from './pages/Plantilla.jsx'
import Gastos from './pages/Gastos.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ahorros from './pages/Ahorros.jsx'
import SplashScreen from './components/SplashScreen.jsx'

function App({ dbReady }) {
  const [showSplash, setShowSplash] = useState(true)

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
        <Route element={<Layout />}>
          <Route index element={<Plantilla />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ahorros" element={<Ahorros />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
