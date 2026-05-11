export default function EmptyState({ title = 'Sin resultados', description = 'No hay datos para mostrar.' }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon">📭</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
