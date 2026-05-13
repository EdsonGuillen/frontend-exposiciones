import { useState } from 'react'
import { createEvaluacion } from '../api/exposiciones'
import { useToast } from '../context/ToastContext'

export default function Exposiciones() {
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: '', autor: '' })
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await createEvaluacion(form)
      addToast({ type: 'success', message: 'Evaluación creada correctamente.' })
      setForm({ titulo: '', descripcion: '', fecha: '', autor: '' })
    } catch (error) {
      addToast({
        type: 'error',
        message: error?.message || 'Error al evaluar. Por favor, inténtalo de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Exposiciones</h1>
      <p className="page-sub">Crea y administra tus evaluaciones de exposiciones.</p>

      <form className="exposiciones-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Título
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Título de la exposición"
            required
          />
        </label>

        <label className="form-label">
          Autor
          <input
            type="text"
            name="autor"
            value={form.autor}
            onChange={handleChange}
            placeholder="Nombre del autor"
            required
          />
        </label>

        <label className="form-label">
          Fecha
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-label">
          Descripción
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción de la exposición"
            rows="4"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Guardando...' : 'Crear evaluación'}
        </button>
      </form>
    </div>
  )
}
