import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Wallet, CreditCard, BarChart3, Coins, Settings, Plus, Info } from 'lucide-react'
import { useState } from 'react'
import InstallPWA from './InstallPWA.jsx'
import InstallModal from './InstallModal.jsx'
import InfoModal from './InfoModal.jsx'
import SettingsModal from './SettingsModal.jsx'
import GastoDiarioModal from './GastoDiarioModal.jsx'

const tabs = [
  { path: '/', label: 'Plantilla', icon: Wallet },
  { path: '/gastos', label: 'Gastos', icon: CreditCard },
  { path: '/ahorros', label: 'Ahorros', icon: Coins },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [gastoModalOpen, setGastoModalOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-svh" style={{ background: 'var(--color-bg)' }}>
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <img src="/logo_minimalista_claro.png" alt="Zentro" className="h-8 dark:hidden" />
        <img src="/logo_minimalista_oscuro.png" alt="Zentro" className="h-8 hidden dark:block" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="cursor-pointer transition-all duration-150 active:scale-90"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Info size={20} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer transition-all duration-150 active:scale-90"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <div className="fixed bottom-28 right-4 z-20">
        <InstallPWA />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-center pb-3 pt-1 z-10 pointer-events-none">
        <div
          className="flex items-center justify-center gap-5 rounded-2xl px-5 py-2 shadow-lg border pointer-events-auto"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor: 'var(--color-border)',
          }}
        >
          {tabs.slice(0, 2).map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} aria-label={tab.label}
                className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                }}>
                <Icon size={22} />
              </button>
            )
          })}

          <button onClick={() => setGastoModalOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-150 active:scale-90 hover:scale-105 cursor-pointer"
            style={{ background: '#ea580c' }}>
            <Plus size={26} color="#fff" />
          </button>

          {tabs.slice(2).map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} aria-label={tab.label}
                className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                }}>
                <Icon size={22} />
              </button>
            )
          })}
        </div>
      </nav>

      <InstallModal />
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GastoDiarioModal isOpen={gastoModalOpen} onClose={() => setGastoModalOpen(false)} onSaved={() => window.dispatchEvent(new CustomEvent('zentro:data-changed'))} />
    </div>
  )
}

export default Layout
