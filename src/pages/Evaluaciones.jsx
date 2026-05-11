import { useState } from 'react'
import { createEvaluacion } from '../api/evaluaciones'
import { useToast } from '../context/ToastContext'

// Criterios de ejemplo — en producción estos vendrían de un endpoint
const CRITERIOS_DEFAULT = [
  { id_criterio: 1, nombre: 'Dominio del tema' },
  { id_criterio: 2, nombre: 'Claridad en la exposición' },
  { id_criterio: 3, nombre: 'Material de apoyo' },
  { id_criterio: 4, nombre: 'Manejo del tiempo' },
  { id_criterio: 5, nombre: 'Respuesta a preguntas' },
]

export default function Evaluaciones() {
  const toast = useToast()

  const [form, setForm] = useState({
    id_exposicion: '',
    id_alumno_evaluador: '',
  })
  const [calificaciones, setCalificaciones] = useState(
    Object.fromEntries(CRITERIOS_DEFAULT.map((c) => [c.id_criterio, '']))
  )
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)

  const handleField = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((v) => ({ ...v, [e.target.name]: undefined }))
  }

  const handleCal = (id, val) => {
    setCalificaciones((c) => ({ ...c, [id]: val }))
    setErrors((v) => ({ ...v, [`criterio_${id}`]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.id_exposicion.trim())      e.id_exposicion      = 'Requerido'
    if (!form.id_alumno_evaluador.trim()) e.id_alumno_evaluador = 'Requerido'
    CRITERIOS_DEFAULT.forEach(({ id_criterio }) => {
      const val = parseFloat(calificaciones[id_criterio])
      if (calificaciones[id_criterio] === '') e[`criterio_${id_criterio}`] = 'Requerido'
      else if (isNaN(val) || val < 0 || val > 10) e[`criterio_${id_criterio}`] = '0 – 10'
    })
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await createEvaluacion({
        id_exposicion:       parseInt(form.id_exposicion),
        id_alumno_evaluador: parseInt(form.id_alumno_evaluador),
        detalles: CRITERIOS_DEFAULT.map((c) => ({
          id_criterio:  c.id_criterio,
          calificacion: parseFloat(calificaciones[c.id_criterio]),
        })),
      })
      toast.success('Evaluación registrada correctamente')
      setSuccess(true)
    } catch (err) {
      const status = err.response?.status
      if (status === 409) toast.error('Este alumno ya evaluó esa exposición')
      else if (status === 400) toast.error('Datos inválidos. Revisa el formulario')
      else toast.error('Error al registrar la evaluación')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm({ id_exposicion: '', id_alumno_evaluador: '' })
    setCalificaciones(Object.fromEntries(CRITERIOS_DEFAULT.map((c) => [c.id_criterio, ''])))
    setErrors({})
    setSuccess(false)
  }

  // Promedio en tiempo real
  const vals = CRITERIOS_DEFAULT.map((c) => parseFloat(calificaciones[c.id_criterio])).filter((v) => !isNaN(v))
  const promedio = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '—'

  if (success) {
    return (
      <div className="success-card">
        <span className="success-icon">✅</span>
        <h2>Evaluación registrada</h2>
        <p>La evaluación fue guardada exitosamente.</p>
        <button className="btn-primary" onClick={handleReset}>Registrar otra evaluación</button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Registrar evaluación</h1>

      <form onSubmit={handleSubmit} noValidate className="eval-form">
        {/* Identificadores */}
        <div className="form-row">
          <div className="field">
            <label htmlFor="id_exposicion">ID Exposición</label>
            <input id="id_exposicion" name="id_exposicion" type="number" min="1"
              placeholder="Ej. 2" value={form.id_exposicion} onChange={handleField}
              aria-invalid={!!errors.id_exposicion} />
            {errors.id_exposicion && <span className="field-error">{errors.id_exposicion}</span>}
          </div>
          <div className="field">
            <label htmlFor="id_alumno_evaluador">ID Alumno evaluador</label>
            <input id="id_alumno_evaluador" name="id_alumno_evaluador" type="number" min="1"
              placeholder="Ej. 5" value={form.id_alumno_evaluador} onChange={handleField}
              aria-invalid={!!errors.id_alumno_evaluador} />
            {errors.id_alumno_evaluador && <span className="field-error">{errors.id_alumno_evaluador}</span>}
          </div>
        </div>

        {/* Rúbrica dinámica */}
        <h2 className="section-heading">Rúbrica de evaluación</h2>
        <div className="rubrica">
          {CRITERIOS_DEFAULT.map(({ id_criterio, nombre }) => (
            <div key={id_criterio} className="criterio-row">
              <span className="criterio-nombre">{nombre}</span>
              <div className="criterio-input-wrap">
                <input
                  type="number" min="0" max="10" step="0.5"
                  placeholder="0 – 10"
                  value={calificaciones[id_criterio]}
                  onChange={(e) => handleCal(id_criterio, e.target.value)}
                  aria-label={`Calificación: ${nombre}`}
                  aria-invalid={!!errors[`criterio_${id_criterio}`]}
                  className="cal-input"
                />
                {errors[`criterio_${id_criterio}`] && (
                  <span className="field-error">{errors[`criterio_${id_criterio}`]}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Promedio en tiempo real */}
        <div className="promedio-bar">
          <span>Promedio actual</span>
          <strong className="promedio-val">{promedio}</strong>
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={saving}>
          {saving ? 'Guardando…' : 'Registrar evaluación'}
        </button>
      </form>
    </div>
  )
}
