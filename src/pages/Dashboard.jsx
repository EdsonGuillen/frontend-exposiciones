import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function DashboardAdmin() {
  const cards = [
    { label: 'Materias',     sub: 'Gestionar materias',     to: '/materias' },
    { label: 'Grupos',       sub: 'Gestionar grupos',       to: '/grupos' },
    { label: 'Alumnos',      sub: 'Gestionar alumnos',      to: '/alumnos' },
    { label: 'Equipos',      sub: 'Gestionar equipos',      to: '/equipos' },
    { label: 'Exposiciones', sub: 'Gestionar exposiciones', to: '/exposiciones' },
    { label: 'Evaluaciones', sub: 'Ver evaluaciones',       to: '/evaluaciones' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de administración</h1>
          <p className="page-sub">Gestiona todos los recursos del sistema</p>
        </div>
      </div>
      <div className="action-grid">
        {cards.map(({ label, sub, to }) => (
          <Link key={to} to={to} className="action-card">
            <div className="action-card-label">{label}</div>
            <div className="action-card-sub">{sub}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DashboardAlumno({ username }) {
  return (
    <div>
      <div className="welcome-card">
        <div className="welcome-title">Bienvenido, {username}</div>
        <div className="welcome-sub">Aqui puedes registrar tus evaluaciones de exposiciones</div>
      </div>
      <div className="action-grid">
        <Link to="/evaluaciones" className="action-card">
          <div className="action-card-label">Registrar evaluacion</div>
          <div className="action-card-sub">Evalua una exposicion con la rubrica</div>
        </Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, rol } = useAuth()
  return rol === 'admin'
    ? <DashboardAdmin />
    : <DashboardAlumno username={user?.username} />
}
