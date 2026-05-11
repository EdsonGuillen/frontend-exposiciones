import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '🏠' },
  { to: '/materias',     label: 'Materias',     icon: '📚' },
  { to: '/grupos',       label: 'Grupos',       icon: '👥' },
  { to: '/alumnos',      label: 'Alumnos',      icon: '🎓' },
  { to: '/equipos',      label: 'Equipos',      icon: '🤝' },
  { to: '/exposiciones', label: 'Exposiciones', icon: '🎤' },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: '📝' },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? '' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          {open && <span className="sidebar-brand">📋 Exposiciones</span>}
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Colapsar menú">
            {open ? '◀' : '▶'}
          </button>
        </div>

        <nav aria-label="Menú principal">
          <ul className="sidebar-nav">
            {NAV.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <span className="nav-icon" aria-hidden="true">{icon}</span>
                  {open && <span className="nav-label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {open && <span className="sidebar-username">{user?.username}</span>}
          <button className="icon-btn logout-btn" onClick={handleLogout} aria-label="Cerrar sesión">
            {open ? 'Salir' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrap">
        <header className="navbar">
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Menú">☰</button>
          <span className="navbar-title">Sistema de Exposiciones</span>
          <span className="navbar-user">👤 {user?.username}</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
