import { useState, useEffect, useCallback } from 'react'
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  deleteAlumno
} from '../api/alumnos'

import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Confirm from '../components/ui/Confirm'

const EMPTY_FORM = {
  nombre: '',
  username: '',
  password: '',
  id_grupo: ''
}

export default function Alumnos() {

  const toast = useToast()

  // Tabla
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0
  })

  const [page, setPage] = useState(0)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Delete
  const [delTarget, setDelTarget] = useState(null)

  // Cargar alumnos
  const load = useCallback(async () => {

    setLoading(true)

    try {

      const res = await getAlumnos({
        page,
        size: 10,
        nombre
      })

      setData(res)

    } catch {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoading(false)
    }

  }, [page, nombre])

  useEffect(() => {
    load()
  }, [load])

  // Filtro
  const handleFilter = (e) => {
    setNombre(e.target.value)
    setPage(0)
  }

  // Abrir modal crear
  const openCreate = () => {

    setEditing(null)

    setForm({
      nombre: '',
      username: '',
      password: '',
      id_grupo: ''
    })

    setFormErrors({})
    setShowModal(true)
  }

  // Abrir modal editar
 const openEdit = (alumno) => {

  console.log(alumno)

  setEditing(alumno)

  setForm({
    nombre: alumno.nombre,
    username: alumno.username,
    password: '',
    id_grupo: alumno.id_grupo
  })

  setFormErrors({})
  setShowModal(true)
}

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  // Validación
  const validate = () => {

    const e = {}

    if (!form.nombre.trim()) {
      e.nombre = 'El nombre es obligatorio'
    }

    if (!form.username.trim()) {
      e.username = 'El username es obligatorio'
    }

    if (!form.id_grupo) {
      e.id_grupo = 'El grupo es obligatorio'
    }

    // Password solo al crear
    if (!editing && !form.password.trim()) {
      e.password = 'La contraseña es obligatoria'
    }

    return e
  }

  // Guardar
  const handleSave = async () => {

    const errs = validate()

    if (Object.keys(errs).length) {
      setFormErrors(errs)
      return
    }

    setSaving(true)

    try {

      // Copia del form
      const payload = {
        ...form,
        id_grupo: Number(form.id_grupo)
      }

      // Si password viene vacío, eliminarlo
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password
      }

      if (editing) {

        await updateAlumno(
          editing.id_alumno,
          payload
        )

        toast.success('Alumno actualizado correctamente')

      } else {

        await createAlumno(payload)

        toast.success('Alumno creado correctamente')
      }

      closeModal()
      load()

    } catch (err) {

      const status = err.response?.status

      if (status === 409) {
        toast.error('Ya existe un alumno con ese username')
      } else if (status === 404) {
        toast.error('Alumno no encontrado')
      } else if (status === 400) {
        toast.error('Datos inválidos')
      } else {
        toast.error('Error al guardar el alumno')
      }

    } finally {
      setSaving(false)
    }
  }

  // Eliminar
  const handleDelete = async () => {

    try {

      await deleteAlumno(delTarget.id_alumno)

      toast.success('Alumno eliminado')

      setDelTarget(null)

      if (data.content.length === 1 && page > 0) {
        setPage(page - 1)
      } else {
        load()
      }

    } catch (err) {

      if (err.response?.status === 404) {
        toast.error('Alumno no encontrado')
      } else {
        toast.error('Error al eliminar')
      }

      setDelTarget(null)
    }
  }

  return (
    <div>

      <div className="page-header">
        <h1 className="page-title">Alumnos</h1>

        <button
          className="btn-primary"
          onClick={openCreate}
        >
          + Nuevo alumno
        </button>
      </div>

      {/* Filtro */}
      <div className="toolbar">

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={nombre}
          onChange={handleFilter}
          className="filter-input"
        />

      </div>

      {/* Tabla */}
      {
        loading
          ? <Spinner />
          : data.content.length === 0
            ? (
              <EmptyState
                title="Sin alumnos"
                description="Crea el primer alumno"
              />
            )
            : (
              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Username</th>
                      <th>ID Grupo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>

                    {
                      data.content.map((a) => (

                        <tr key={a.id_alumno}>

                          <td>{a.id_alumno}</td>

                          <td>{a.nombre}</td>

                          <td>
                            <code>{a.username}</code>
                          </td>

                          <td>{a.id_grupo}</td>

                          <td className="actions">

                            <button
                              className="btn-sm btn-secondary"
                              onClick={() => openEdit(a)}
                            >
                              Editar
                            </button>

                            <button
                              className="btn-sm btn-danger"
                              onClick={() => setDelTarget(a)}
                            >
                              Eliminar
                            </button>

                          </td>

                        </tr>
                      ))
                    }

                  </tbody>

                </table>

                {/* Paginación */}
                <div className="pagination">

                  <span className="pag-info">
                    {data.totalElements} resultado{data.totalElements !== 1 ? 's' : ''}
                  </span>

                  <div className="pag-btns">

                    <button
                      className="btn-sm btn-secondary"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      ← Anterior
                    </button>

                    <span className="pag-page">
                      Página {page + 1} de {data.totalPages || 1}
                    </span>

                    <button
                      className="btn-sm btn-secondary"
                      disabled={page + 1 >= data.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Siguiente →
                    </button>

                  </div>

                </div>

              </div>
            )
      }

      {/* Modal */}
      {
        showModal && (

          <Modal
            title={editing ? 'Editar alumno' : 'Nuevo alumno'}
            onClose={closeModal}
            footer={
              <>
                <button
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {
                    saving
                      ? 'Guardando...'
                      : editing
                        ? 'Guardar cambios'
                        : 'Crear alumno'
                  }
                </button>
              </>
            }
          >

            {/* Nombre */}
            <div className="field">

              <label>Nombre</label>

              <input
                type="text"
                value={form.nombre}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    nombre: e.target.value
                  }))
                }}
              />

              {formErrors.nombre && (
                <span className="field-error">
                  {formErrors.nombre}
                </span>
              )}

            </div>

            {/* Username */}
            <div className="field">

              <label>Username</label>

              <input
                type="text"
                value={form.username}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    username: e.target.value
                  }))
                }}
              />

              {formErrors.username && (
                <span className="field-error">
                  {formErrors.username}
                </span>
              )}

            </div>

            {/* Password */}
            <div className="field">

              <label>Contraseña</label>

              <input
                type="password"
                value={form.password}
                placeholder={editing ? 'Dejar vacío para no cambiarla' : ''}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    password: e.target.value
                  }))
                }}
              />

              {formErrors.password && (
                <span className="field-error">
                  {formErrors.password}
                </span>
              )}

            </div>

            {/* Grupo */}
            <div className="field">

              <label>ID Grupo</label>

              <input
                type="number"
                value={form.id_grupo}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    id_grupo: Number(e.target.value)
                  }))
                }}
              />

              {formErrors.id_grupo && (
                <span className="field-error">
                  {formErrors.id_grupo}
                </span>
              )}

            </div>

          </Modal>
        )
      }

      {/* Confirm */}
      {
        delTarget && (

          <Confirm
            message={`¿Eliminar al alumno "${delTarget.nombre}"?`}
            onConfirm={handleDelete}
            onCancel={() => setDelTarget(null)}
          />

        )
      }

    </div>
  )
}