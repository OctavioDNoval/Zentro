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
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <img src="/logo_minimalista_claro.png" alt="Zentro" className="h-7 dark:hidden" />
        <img src="/logo_minimalista_oscuro.png" alt="Zentro" className="h-7 hidden dark:block" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setInfoOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 hover:bg-[var(--color-accent-glow)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 hover:bg-[var(--color-accent-glow)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28">
        <Outlet />
      </main>

      <div className="fixed bottom-28 right-4 z-20">
        <InstallPWA />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 pt-2 z-10 pointer-events-none">
        <div
          className="flex items-center justify-center gap-2 rounded-2xl px-3 py-2 pointer-events-auto"
          style={{
            background: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
            backdropFilter: 'blur(24px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
            border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
            boxShadow: '0 8px 32px -4px rgba(0,0,0,0.15), 0 0 0 1px color-mix(in srgb, var(--color-border) 30%, transparent)',
          }}
        >
          {tabs.slice(0, 2).map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} aria-label={tab.label}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-tertiary)',
                  boxShadow: isActive ? '0 4px 12px -2px var(--color-accent-glow)' : 'none',
                }}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </button>
            )
          })}

          <button onClick={() => setGastoModalOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-200 active:scale-90 hover:scale-105 hover:shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
              boxShadow: '0 4px 16px -2px rgba(249, 115, 22, 0.4)',
            }}>
            <Plus size={24} color="#fff" strokeWidth={2.5} />
          </button>

          {tabs.slice(2).map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} aria-label={tab.label}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-tertiary)',
                  boxShadow: isActive ? '0 4px 12px -2px var(--color-accent-glow)' : 'none',
                }}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
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
