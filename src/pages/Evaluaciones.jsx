import { useState, useEffect } from 'react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const CRITERIOS = [
  { id_criterio: 1, nombre: 'Dominio del tema' },
  { id_criterio: 2, nombre: 'Claridad en la exposicion' },
  { id_criterio: 3, nombre: 'Material de apoyo' },
  { id_criterio: 4, nombre: 'Manejo del tiempo' },
  { id_criterio: 5, nombre: 'Respuesta a preguntas' },
]

export default function Evaluaciones() {
  const toast = useToast()
  const { user } = useAuth()

  const [exposiciones, setExposiciones] = useState([])
  const [alumnos,      setAlumnos]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [success,      setSuccess]      = useState(false)

  const [form, setForm] = useState({
    id_exposicion: '',
    id_alumno_evaluador: '',
  })
  const [calificaciones, setCalificaciones] = useState(
    Object.fromEntries(CRITERIOS.map((c) => [c.id_criterio, '']))
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ex, al] = await Promise.all([
          client.get('/exposiciones'),
          client.get('/alumnos'),
        ])
        setExposiciones(ex.data.content || ex.data)
        setAlumnos(al.data.content || al.data)
      } catch { toast.error('Error al cargar datos') }
      finally { setLoading(false) }
    }
    fetchData()
  }, []) // eslint-disable-line

  const validate = () => {
    const e = {}
    if (!form.id_exposicion)       e.id_exposicion       = 'Selecciona una exposicion'
    if (!form.id_alumno_evaluador) e.id_alumno_evaluador = 'Selecciona un alumno evaluador'
    CRITERIOS.forEach(({ id_criterio }) => {
      const val = parseFloat(calificaciones[id_criterio])
      if (calificaciones[id_criterio] === '') e[`criterio_${id_criterio}`] = 'Requerido'
      else if (isNaN(val) || val < 0 || val > 10) e[`criterio_${id_criterio}`] = '0-10'
    })
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await client.post('/evaluaciones', {
        id_exposicion:       parseInt(form.id_exposicion),
        id_alumno_evaluador: parseInt(form.id_alumno_evaluador),
        detalles: CRITERIOS.map((c) => ({
          id_criterio:  c.id_criterio,
          calificacion: parseFloat(calificaciones[c.id_criterio]),
        })),
      })
      toast.success('Evaluacion registrada correctamente')
      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 409) toast.error('Este alumno ya evaluo esa exposicion')
      else toast.error('Error al registrar la evaluacion')
    } finally { setSaving(false) }
  }

  const handleReset = () => {
    setForm({ id_exposicion: '', id_alumno_evaluador: '' })
    setCalificaciones(Object.fromEntries(CRITERIOS.map((c) => [c.id_criterio, ''])))
    setErrors({})
    setSuccess(false)
  }

  const vals = CRITERIOS.map((c) => parseFloat(calificaciones[c.id_criterio])).filter((v) => !isNaN(v))
  const promedio = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '—'

  if (loading) return <Spinner />

  if (success) {
    return (
      <div className="success-card">
        <h2>Evaluacion registrada</h2>
        <p>La evaluacion fue guardada exitosamente.</p>
        <button className="btn-primary" onClick={handleReset}>Registrar otra evaluacion</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar evaluacion</h1>
          <p className="page-sub">Completa la rubrica para evaluar una exposicion</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="eval-form">
        <div className="form-row">
          <div className="field">
            <label>Exposicion</label>
            <select value={form.id_exposicion}
              onChange={(e) => { setForm(f => ({ ...f, id_exposicion: e.target.value })); setErrors(v => ({ ...v, id_exposicion: undefined })) }}
              aria-invalid={!!errors.id_exposicion}>
              <option value="">Selecciona una exposicion...</option>
              {exposiciones.map(ex => (
                <option key={ex.id_exposicion} value={ex.id_exposicion}>{ex.titulo}</option>
              ))}
            </select>
            {errors.id_exposicion && <span className="field-error">{errors.id_exposicion}</span>}
          </div>

          <div className="field">
            <label>Alumno evaluador</label>
            <select value={form.id_alumno_evaluador}
              onChange={(e) => { setForm(f => ({ ...f, id_alumno_evaluador: e.target.value })); setErrors(v => ({ ...v, id_alumno_evaluador: undefined })) }}
              aria-invalid={!!errors.id_alumno_evaluador}>
              <option value="">Selecciona un alumno...</option>
              {alumnos.map(a => (
                <option key={a.id_alumno} value={a.id_alumno}>{a.nombre}</option>
              ))}
            </select>
            {errors.id_alumno_evaluador && <span className="field-error">{errors.id_alumno_evaluador}</span>}
          </div>
        </div>

        <p className="section-heading">Rubrica de evaluacion</p>
        <div className="rubrica">
          {CRITERIOS.map(({ id_criterio, nombre }) => (
            <div key={id_criterio} className="criterio-row">
              <span className="criterio-nombre">{nombre}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <input type="number" min="0" max="10" step="0.5"
                  placeholder="0-10"
                  value={calificaciones[id_criterio]}
                  onChange={(e) => { setCalificaciones(c => ({ ...c, [id_criterio]: e.target.value })); setErrors(v => ({ ...v, [`criterio_${id_criterio}`]: undefined })) }}
                  className="cal-input"
                  aria-invalid={!!errors[`criterio_${id_criterio}`]} />
                {errors[`criterio_${id_criterio}`] && <span className="field-error">{errors[`criterio_${id_criterio}`]}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="promedio-bar">
          <span>Promedio actual</span>
          <strong className="promedio-val">{promedio}</strong>
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={saving}>
          {saving ? 'Guardando...' : 'Registrar evaluacion'}
        </button>
      </form>
    </div>
  )
}
