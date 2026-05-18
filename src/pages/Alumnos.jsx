import { useState, useEffect, useCallback } from 'react'
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from '../api/alumnos'
import client from '../api/client'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Confirm from '../components/ui/Confirm'

const EMPTY_FORM = {
  nombre: '',
  username: '',
  password: '',
  id_grupo: '',
  rol: 'alumno'
}

export default function Alumnos() {
  const toast = useToast()
  const [data,       setData]       = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [grupos,     setGrupos]     = useState([])
  const [page,       setPage]       = useState(0)
  const [nombre,     setNombre]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [delTarget,  setDelTarget]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, g] = await Promise.all([
        getAlumnos({ page, size: 10, nombre }),
        client.get('/grupos'),
      ])
      setData(a)
      setGrupos(g.data.content || g.data)
    } catch {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }, [page, nombre]) // eslint-disable-line

  useEffect(() => { load() }, [load])

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio'
    if (!form.username.trim()) e.username = 'El usuario es obligatorio'
    if (!editing && !form.password.trim()) e.password = 'La contrasena es obligatoria'
    return e
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }
  const openEdit   = (a) => {
    setEditing(a)
    setForm({ nombre: a.nombre, username: a.username, password: '', id_grupo: a.id_grupo || '', rol: a.rol || 'alumno' })
    setFormErrors({})
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = async () => {
  const errs = validate()
  console.log('Errores:', errs)
  console.log('Form:', form)
  if (Object.keys(errs).length) { setFormErrors(errs); return }
  setSaving(true)
  try {
    const payload = {
      nombre:   form.nombre,
      username: form.username,
      id_grupo: form.id_grupo ? Number(form.id_grupo) : null,
      rol:      form.rol,
    }
    if (form.password.trim()) payload.password = form.password
    console.log('Payload final:', payload)
    console.log('Editing ID:', editing?.id_alumno)

    if (editing) {
      console.log('Llamando updateAlumno...')
      const res = await updateAlumno(editing.id_alumno, payload)
      console.log('Respuesta:', res)
      toast.success('Alumno actualizado correctamente')
    } else {
      payload.password = form.password
      await createAlumno(payload)
      toast.success('Alumno creado correctamente')
    }
    closeModal()
    load()
  } catch (err) {
    console.error('Error completo:', err)
    const status = err.response?.status
    if (status === 409) toast.error('Ese username ya existe')
    else toast.error('Error al guardar el alumno')
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async () => {
    try {
      await deleteAlumno(delTarget.id_alumno)
      toast.success('Alumno eliminado')
      setDelTarget(null)
      load()
    } catch {
      toast.error('Error al eliminar')
      setDelTarget(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alumnos</h1>
          <p className="page-sub">Gestiona los alumnos del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>Nuevo alumno</button>
      </div>

      <div className="toolbar">
        <input type="text" placeholder="Buscar por nombre..."
          value={nombre} onChange={(e) => { setNombre(e.target.value); setPage(0) }}
          className="filter-input" />
      </div>

      {loading ? <Spinner /> : data.content.length === 0
        ? <EmptyState title="Sin alumnos" description="Crea el primer alumno." />
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Usuario</th><th>Grupo</th><th>Rol</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {data.content.map((a) => (
                  <tr key={a.id_alumno}>
                    <td>{a.id_alumno}</td>
                    <td>{a.nombre}</td>
                    <td><code>{a.username}</code></td>
                    <td>{a.nombre_grupo || '—'}</td>
                    <td>{a.rol === 'admin' ? 'Administrador' : 'Alumno'}</td>
                    <td className="actions">
                      <button className="btn-sm btn-secondary" onClick={() => openEdit(a)}>Editar</button>
                      <button className="btn-sm btn-danger" onClick={() => setDelTarget(a)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <span className="pag-info">{data.totalElements} resultado{data.totalElements !== 1 ? 's' : ''}</span>
              <div className="pag-btns">
                <button className="btn-sm btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
                <span className="pag-page">Pagina {page + 1} de {data.totalPages || 1}</span>
                <button className="btn-sm btn-secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
              </div>
            </div>
          </div>
        )}

      {showModal && (
        <Modal
          title={editing ? 'Editar alumno' : 'Nuevo alumno'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear alumno'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Nombre completo</label>
            <input type="text" placeholder="Ej. Juan Perez"
              value={form.nombre}
              onChange={(e) => { setForm(f => ({ ...f, nombre: e.target.value })); setFormErrors(v => ({ ...v, nombre: undefined })) }}
              aria-invalid={!!formErrors.nombre} />
            {formErrors.nombre && <span className="field-error">{formErrors.nombre}</span>}
          </div>

          <div className="field">
            <label>Usuario</label>
            <input type="text" placeholder="Ej. alumno6"
              value={form.username}
              onChange={(e) => { setForm(f => ({ ...f, username: e.target.value })); setFormErrors(v => ({ ...v, username: undefined })) }}
              aria-invalid={!!formErrors.username} />
            {formErrors.username && <span className="field-error">{formErrors.username}</span>}
          </div>

          <div className="field">
            <label>Contrasena {editing && '(dejar vacio para no cambiar)'}</label>
            <input type="password" placeholder="••••••"
              value={form.password}
              onChange={(e) => { setForm(f => ({ ...f, password: e.target.value })); setFormErrors(v => ({ ...v, password: undefined })) }}
              aria-invalid={!!formErrors.password} />
            {formErrors.password && <span className="field-error">{formErrors.password}</span>}
          </div>

          <div className="field">
            <label>Grupo</label>
            <select value={form.id_grupo}
              onChange={(e) => setForm(f => ({ ...f, id_grupo: e.target.value }))}>
              <option value="">Sin grupo</option>
              {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Rol</label>
            <select value={form.rol}
              onChange={(e) => setForm(f => ({ ...f, rol: e.target.value }))}>
              <option value="alumno">Alumno</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Confirm
          message={`Eliminar al alumno "${delTarget.nombre}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </div>
  )
}