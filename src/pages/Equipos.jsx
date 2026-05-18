import { useState, useEffect } from 'react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

const EMPTY_FORM = { nombre: '', id_grupo: '' }

export default function Equipos() {
  const toast = useToast()
  const [data,       setData]       = useState([])
  const [grupos,     setGrupos]     = useState([])
  const [loading,    setLoading]    = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [eq, gr] = await Promise.all([
        client.get('/equipos'),
        client.get('/grupos'),
      ])
      setData(eq.data.content || eq.data)
      setGrupos(gr.data.content || gr.data)
    } catch { toast.error('Error al cargar los equipos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre   = 'El nombre es obligatorio'
    if (!form.id_grupo)      e.id_grupo = 'Selecciona un grupo'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      await client.post('/equipos', {
        nombre:   form.nombre.trim(),
        id_grupo: parseInt(form.id_grupo),
      })
      toast.success('Equipo creado correctamente')
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      if (err.response?.status === 409) toast.error('Ya existe un equipo con ese nombre')
      else toast.error('Error al guardar el equipo')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await client.delete(`/equipos/${id}`)
      toast.success('Equipo eliminado')
      load()
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipos</h1>
          <p className="page-sub">Gestiona los equipos de exposicion</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }}>
          Nuevo equipo
        </button>
      </div>

      {loading ? <Spinner /> : data.length === 0
        ? <EmptyState title="Sin equipos" description="Crea el primer equipo." />
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Grupo</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {data.map((e) => (
                  <tr key={e.id_equipo}>
                    <td>{e.id_equipo}</td>
                    <td>{e.nombre}</td>
                    <td>{e.nombre_grupo}</td>
                    <td className="actions">
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(e.id_equipo)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showModal && (
        <Modal title="Nuevo equipo" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Crear equipo'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Nombre</label>
            <input type="text" placeholder="Ej. Equipo Alpha"
              value={form.nombre}
              onChange={(e) => { setForm(f => ({ ...f, nombre: e.target.value })); setFormErrors(v => ({ ...v, nombre: undefined })) }}
              aria-invalid={!!formErrors.nombre} />
            {formErrors.nombre && <span className="field-error">{formErrors.nombre}</span>}
          </div>
          <div className="field">
            <label>Grupo</label>
            <select value={form.id_grupo}
              onChange={(e) => { setForm(f => ({ ...f, id_grupo: e.target.value })); setFormErrors(v => ({ ...v, id_grupo: undefined })) }}
              aria-invalid={!!formErrors.id_grupo}>
              <option value="">Selecciona un grupo...</option>
              {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
            </select>
            {formErrors.id_grupo && <span className="field-error">{formErrors.id_grupo}</span>}
          </div>
        </Modal>
      )}
    </div>
  )
}
