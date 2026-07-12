import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { seedDatabase } from './db/seed.js'
import { ejecutarCicloMensual } from './db/ciclo-mensual.js'

seedDatabase().then(() => ejecutarCicloMensual())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
