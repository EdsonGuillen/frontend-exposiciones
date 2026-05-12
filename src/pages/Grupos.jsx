import { useState, useEffect, useCallback } from 'react'

import {
  getGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo
} from '../api/grupos'

import { getMaterias } from '../api/materias'

import { useToast } from '../context/ToastContext'

import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Confirm from '../components/ui/Confirm'

const EMPTY_FORM = {
  nombre: '',
  id_materia: ''
}

export default function Grupos() {

  const toast = useToast()

  // Tabla
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0
  })

  const [materias, setMaterias] = useState([])

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

  // Cargar grupos
  const load = useCallback(async () => {

    setLoading(true)

    try {

      const res = await getGrupos({
        page,
        size: 10,
        nombre
      })

      setData(res)

    } catch {
      toast.error('Error al cargar los grupos')
    } finally {
      setLoading(false)
    }

  }, [page, nombre])

  // Cargar materias
  const loadMaterias = async () => {

    try {

      const res = await getMaterias({
        size: 100
      })

      setMaterias(res.content)

    } catch {
      toast.error('Error al cargar las materias')
    }
  }

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadMaterias()
  }, [])

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
      id_materia: ''
    })

    setFormErrors({})

    setShowModal(true)
  }

  // Abrir modal editar
  const openEdit = (grupo) => {

    setEditing(grupo)

    setForm({
      nombre: grupo.nombre,
      id_materia: grupo.id_materia
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

    if (!form.id_materia) {
      e.id_materia = 'La materia es obligatoria'
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

      const payload = {
        ...form,
        id_materia: Number(form.id_materia)
      }

      if (editing) {

        await updateGrupo(
          editing.id_grupo,
          payload
        )

        toast.success('Grupo actualizado correctamente')

      } else {

        await createGrupo(payload)

        toast.success('Grupo creado correctamente')
      }

      closeModal()

      load()

    } catch (err) {

      const status = err.response?.status

      if (status === 409) {
        toast.error('Ya existe un grupo con ese nombre')
      } else if (status === 404) {
        toast.error('Grupo no encontrado')
      } else if (status === 400) {
        toast.error('Datos inválidos')
      } else {
        toast.error('Error al guardar el grupo')
      }

    } finally {
      setSaving(false)
    }
  }

  // Eliminar
  const handleDelete = async () => {

    try {

      await deleteGrupo(delTarget.id_grupo)

      toast.success('Grupo eliminado')

      setDelTarget(null)

      if (data.content.length === 1 && page > 0) {
        setPage(page - 1)
      } else {
        load()
      }

    } catch (err) {

      if (err.response?.status === 404) {
        toast.error('Grupo no encontrado')
      } else {
        toast.error('Error al eliminar')
      }

      setDelTarget(null)
    }
  }

  return (
    <div>

      <div className="page-header">

        <h1 className="page-title">Grupos</h1>

        <button
          className="btn-primary"
          onClick={openCreate}
        >
          + Nuevo grupo
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
                title="Sin grupos"
                description="Crea el primer grupo"
              />
            )
            : (
              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>ID Materia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>

                    {
                      data.content.map((g) => (

                        <tr key={g.id_grupo}>

                          <td>{g.id_grupo}</td>

                          <td>{g.nombre}</td>

                          <td>{g.id_materia}</td>

                          <td className="actions">

                            <button
                              className="btn-sm btn-secondary"
                              onClick={() => openEdit(g)}
                            >
                              Editar
                            </button>

                            <button
                              className="btn-sm btn-danger"
                              onClick={() => setDelTarget(g)}
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
            title={editing ? 'Editar grupo' : 'Nuevo grupo'}
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
                        : 'Crear grupo'
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

            {/* Materia */}
            <div className="field">

              <label>Materia</label>

              <select
                value={form.id_materia}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    id_materia: Number(e.target.value)
                  }))
                }}
              >
                <option value="">
                  Selecciona una materia
                </option>

                {
                  materias.map((m) => (
                    <option
                      key={m.id_materia}
                      value={m.id_materia}
                    >
                      {m.nombre_materia}
                    </option>
                  ))
                }

              </select>

              {formErrors.id_materia && (
                <span className="field-error">
                  {formErrors.id_materia}
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
            message={`¿Eliminar el grupo "${delTarget.nombre}"?`}
            onConfirm={handleDelete}
            onCancel={() => setDelTarget(null)}
          />

        )
      }

    </div>
  )
}