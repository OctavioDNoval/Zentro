import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { seedDatabase } from './db/seed.js'
import { ejecutarCierreMensual } from './db/ciclo-mensual.js'

const dbReady = seedDatabase()
  .then(() => ejecutarCierreMensual())
  .catch((err) => console.error('Error en inicialización:', err))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App dbReady={dbReady} />
    </BrowserRouter>
  </StrictMode>,
)
