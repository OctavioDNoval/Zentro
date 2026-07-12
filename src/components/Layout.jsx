import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Plantilla', icon: '🏠' },
  { path: '/gastos', label: 'Gastos', icon: '💳' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-3 text-lg font-semibold sticky top-0 z-10">
        Zentro
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition ${
                  isActive
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                <span className="text-xl leading-none mb-0.5">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Layout
