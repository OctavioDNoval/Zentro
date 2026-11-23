import { Wallet, CreditCard, BarChart3, Coins, PieChart, TrendingUp } from 'lucide-react'
import Plantilla from './pages/Plantilla.jsx'
import Gastos from './pages/Gastos.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ahorros from './pages/Ahorros.jsx'
import Ingresos from './pages/Ingresos.jsx'
import Estadisticas from './pages/Estadisticas.jsx'

// Orden de las pestañas: es el orden de la barra inferior y del deslizamiento
export const tabs = [
  { path: '/ingresos', label: 'Ingresos', icon: TrendingUp, Pagina: Ingresos },
  { path: '/', label: 'Plantilla', icon: Wallet, Pagina: Plantilla },
  { path: '/gastos', label: 'Gastos', icon: CreditCard, Pagina: Gastos },
  { path: '/ahorros', label: 'Ahorros', icon: Coins, Pagina: Ahorros },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3, Pagina: Dashboard },
  { path: '/estadisticas', label: 'Estadísticas', icon: PieChart, Pagina: Estadisticas },
]

export const indiceDeRuta = (pathname) => {
  const i = tabs.findIndex((t) => t.path === pathname)
  return i === -1 ? 1 : i
}
