import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const doLogout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await doLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas-soft">
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-hairline-cool bg-canvas lg:static">
          <Link to='/' >
            <div className="flex h-16 items-center gap-3 border-b border-hairline-cool px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-canvas">
                <span className="text-sm font-medium text-primary">R</span>
              </div>
              <div>
                <h1 className="text-base font-medium text-ink">Resumind</h1>
                <p className="text-[11px] font-medium text-ink-mute">Resume Builder</p>
              </div>
            </div>
          </Link>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-[6px] px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink-mute hover:bg-canvas-soft hover:text-ink'
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-ink-mute'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-hairline-cool px-3 py-4">
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-ink">{user?.name || user?.username || 'User'}</p>
              <p className="text-xs text-ink-mute">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost w-full justify-start text-ink-mute hover:text-red-600"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline-cool bg-canvas px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-ghost p-2"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-medium text-ink">
                {navItems.find((i) => i.to === location.pathname)?.label || 'Page'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-hairline bg-canvas text-xs font-medium text-ink">
              {((user?.name || user?.username || 'U')[0]).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function GridIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}
