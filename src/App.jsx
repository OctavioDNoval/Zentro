import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Plantilla from './pages/Plantilla.jsx'
import Gastos from './pages/Gastos.jsx'
import Dashboard from './pages/Dashboard.jsx'
import InstallPWA from './components/InstallPWA.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Plantilla />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <InstallPWA />
    </>
  )
}

export default App
