import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const cards = [
    { label: 'Materias',     icon: '📚', to: '/materias' },
    { label: 'Grupos',       icon: '👥', to: '/grupos' },
    { label: 'Alumnos',      icon: '🎓', to: '/alumnos' },
    { label: 'Equipos',      icon: '🤝', to: '/equipos' },
    { label: 'Exposiciones', icon: '🎤', to: '/exposiciones' },
    { label: 'Evaluaciones', icon: '📝', to: '/evaluaciones' },
  ]

  return (
    <div>
      <h1 className="page-title">Bienvenido, {user?.username} 👋</h1>
      <p className="page-sub">Sistema de gestión de exposiciones</p>

      <div className="dashboard-grid">
        {cards.map(({ label, icon }) => (
          <div key={label} className="dash-card">
            <span className="dash-icon">{icon}</span>
            <span className="dash-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
