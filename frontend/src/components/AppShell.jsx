import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const DESKTOP_MIN = 768
const UNIVERSITY_NAME = 'Hemwati Nandan Bahuguna Garhwal University'

export default function AppShell({
  nav,
  portalLabel,
  homePath,
  userBadgeClass = 'bg-brand-600',
  userCardClass = 'bg-brand-50',
}) {
  const dashboardPath = homePath ?? nav[0]?.to ?? '/'
  const portalShort = portalLabel.replace(/\s*Portal$/i, '')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < DESKTOP_MIN : false
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${DESKTOP_MIN - 1}px)`)
    const update = () => {
      setIsMobile(mq.matches)
      if (!mq.matches) setOpen(false)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!open || !isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open, isMobile])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate(portalLabel.includes('Student') ? '/student/login' : '/librarian/login')
  }

  const Sidebar = (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <Link to={dashboardPath} onClick={() => setOpen(false)} className="app-sidebar-brand-link">
          <img src="/hnbgu-logo.png" alt="HNBGU Logo" className="w-11 h-11 object-contain shrink-0" />
          <div className="min-w-0">
            <p className="font-serif font-semibold text-[0.72rem] text-[#0f1f0f] leading-snug line-clamp-3">
              {UNIVERSITY_NAME}
            </p>
            <p className="text-[0.6rem] text-brand-600 uppercase tracking-widest mt-1 truncate">{portalLabel}</p>
          </div>
        </Link>
      </div>

      <nav className="app-sidebar-nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-footer">
        <div className={`app-user-card ${userCardClass}`}>
          <div className={`app-user-avatar ${userBadgeClass}`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#0f1f0f] truncate">{user?.name}</p>
            <p className="text-[0.65rem] text-gray-500 truncate">
              {user?.rollNumber || user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="app-logout-btn"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="app-shell">
      {/* Always visible on desktop (≥768px) */}
      <div className="app-sidebar-rail" aria-label="Main navigation">
        {Sidebar}
      </div>

      {/* Mobile only: slide-in drawer when menu is opened */}
      {isMobile && open && (
        <div className="app-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="app-drawer-backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <div className="app-drawer-panel animate-slide-in">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="app-drawer-close btn-ghost"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {Sidebar}
          </div>
        </div>
      )}

      <div className="app-main">
        <header className="app-top-header">
          <div className="app-header-side app-header-side--left">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="app-header-menu-btn btn-ghost p-2"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={20} />
            </button>
          </div>

          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="app-header-brand"
            aria-label="Go to dashboard"
          >
            <span className="app-header-logo-wrap" aria-hidden="true">
              <img src="/hnbgu-logo.png" alt="" className="app-header-logo" />
            </span>
            <p className="app-header-title">{UNIVERSITY_NAME}</p>
          </Link>

          <div className="app-header-side app-header-side--right">
            <span className="app-header-portal" title={portalLabel}>
              <span className="app-header-portal-short">{portalShort}</span>
              <span className="app-header-portal-full">{portalLabel}</span>
            </span>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
