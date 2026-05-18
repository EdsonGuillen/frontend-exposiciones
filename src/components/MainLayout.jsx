import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ADMIN = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/materias',     label: 'Materias' },
  { to: '/grupos',       label: 'Grupos' },
  { to: '/alumnos',      label: 'Alumnos' },
  { to: '/equipos',      label: 'Equipos' },
  { to: '/exposiciones', label: 'Exposiciones' },
  { to: '/evaluaciones', label: 'Evaluaciones' },
]

const NAV_ALUMNO = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/evaluaciones', label: 'Evaluar' },
]

export default function MainLayout() {
  const { user, logout, rol } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleLogout = () => { logout(); navigate('/login') }
  const NAV = rol === 'admin' ? NAV_ADMIN : NAV_ALUMNO

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? '' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          {open && <span className="sidebar-brand">Exposiciones</span>}
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Colapsar menú">
            {open ? '←' : '→'}
          </button>
        </div>

        <nav aria-label="Menú principal">
          <ul className="sidebar-nav">
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  <span className="nav-dot" aria-hidden="true" />
                  {open && <span className="nav-label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {open && (
            <div className="sidebar-info">
              <span className="sidebar-username">{user?.username}</span>
              <span className="sidebar-rol">{rol === 'admin' ? 'Administrador' : 'Alumno'}</span>
            </div>
          )}
          <button className="icon-btn logout-btn" onClick={handleLogout} aria-label="Cerrar sesión">
            {open ? 'Salir' : '←'}
          </button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="navbar">
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Menu">≡</button>
          <span className="navbar-title">Sistema de Exposiciones</span>
          <span className="navbar-user">
            {user?.username}
            <span className={`navbar-badge ${rol === 'alumno' ? 'alumno' : ''}`}>
              {rol === 'admin' ? 'Admin' : 'Alumno'}
            </span>
          </span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
