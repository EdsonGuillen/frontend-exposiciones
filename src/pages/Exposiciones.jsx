import { useState, useEffect } from 'react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Confirm from '../components/ui/Confirm'

const EMPTY_FORM = { titulo: '', fecha: '', id_equipo: '' }

export default function Exposiciones() {
  const toast = useToast()
  const [data,       setData]       = useState([])
  const [equipos,    setEquipos]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [delTarget,  setDelTarget]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [ex, eq] = await Promise.all([
        client.get('/exposiciones'),
        client.get('/equipos'),
      ])
      setData(ex.data.content || ex.data)
      setEquipos(eq.data.content || eq.data)
    } catch { toast.error('Error al cargar las exposiciones') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const validate = () => {
    const e = {}
    if (!form.titulo.trim()) e.titulo    = 'El título es obligatorio'
    if (!form.id_equipo)     e.id_equipo = 'Selecciona un equipo'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      await client.post('/exposiciones', {
        titulo:    form.titulo,
        fecha:     form.fecha || null,
        id_equipo: parseInt(form.id_equipo),
      })
      toast.success('Exposición creada correctamente')
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch { toast.error('Error al crear la exposición') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await client.delete(`/exposiciones/${delTarget.id_exposicion}`)
      toast.success('Exposición eliminada')
      setDelTarget(null)
      load()
    } catch { toast.error('Error al eliminar'); setDelTarget(null) }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Exposiciones</h1>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }}>
          + Nueva exposición
        </button>
      </div>

      {loading ? <Spinner /> : data.length === 0
        ? <EmptyState title="Sin exposiciones" description="Crea la primera exposición." />
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Título</th><th>Fecha</th><th>Equipo</th><th>Acciones</th></tr></thead>
              <tbody>
                {data.map((ex) => (
                  <tr key={ex.id_exposicion}>
                    <td>{ex.id_exposicion}</td>
                    <td>{ex.titulo}</td>
                    <td>{ex.fecha ? new Date(ex.fecha).toLocaleDateString('es-MX') : '—'}</td>
                    <td>{ex.nombre_equipo}</td>
                    <td className="actions">
                      <button className="btn-sm btn-danger" onClick={() => setDelTarget(ex)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showModal && (
        <Modal title="Nueva exposición" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Crear exposición'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Título</label>
            <input type="text" placeholder="Ej. Introducción a React"
              value={form.titulo}
              onChange={(e) => { setForm(f => ({ ...f, titulo: e.target.value })); setFormErrors(v => ({ ...v, titulo: undefined })) }}
              aria-invalid={!!formErrors.titulo} />
            {formErrors.titulo && <span className="field-error">{formErrors.titulo}</span>}
          </div>
          <div className="field">
            <label>Fecha (opcional)</label>
            <input type="date" value={form.fecha}
              onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} />
          </div>
          <div className="field">
            <label>Equipo</label>
            <select value={form.id_equipo}
              onChange={(e) => { setForm(f => ({ ...f, id_equipo: e.target.value })); setFormErrors(v => ({ ...v, id_equipo: undefined })) }}
              aria-invalid={!!formErrors.id_equipo}>
              <option value="">Selecciona un equipo…</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
            </select>
            {formErrors.id_equipo && <span className="field-error">{formErrors.id_equipo}</span>}
          </div>
        </Modal>
      )}

      {delTarget && (
        <Confirm
          message={`¿Eliminar la exposición "${delTarget.titulo}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </div>
  )
}
