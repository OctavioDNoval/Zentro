import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import InstallPWA from './components/InstallPWA.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <InstallPWA />
    </>
  )
}

export default App
