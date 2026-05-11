import { useState, useEffect, useCallback } from 'react'
import { getMaterias, createMateria, updateMateria, deleteMateria } from '../api/materias'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Confirm from '../components/ui/Confirm'

const EMPTY_FORM = { clave_materia: '', nombre_materia: '' }

export default function Materias() {
  const toast = useToast()

  // Listado + paginación + filtros
  const [data,    setData]    = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [page,    setPage]    = useState(0)
  const [nombre,  setNombre]  = useState('')
  const [loading, setLoading] = useState(false)

  // Modal de crear/editar
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)   // null = crear, objeto = editar
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)

  // Modal de confirmación de borrado
  const [delTarget, setDelTarget] = useState(null)

  // ── Cargar materias ──────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMaterias({ page, size: 10, nombre })
      setData(res)
    } catch {
      toast.error('Error al cargar las materias')
    } finally {
      setLoading(false)
    }
  }, [page, nombre]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  // ── Filtro por nombre ────────────────────────────────
  const handleFilter = (e) => {
    setNombre(e.target.value)
    setPage(0)
  }

  // ── Abrir modal ──────────────────────────────────────
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (materia) => {
    setEditing(materia)
    setForm({ clave_materia: materia.clave_materia, nombre_materia: materia.nombre_materia })
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  // ── Validación del formulario ────────────────────────
  const validate = () => {
    const e = {}
    if (!form.clave_materia.trim())  e.clave_materia  = 'La clave es obligatoria'
    if (!form.nombre_materia.trim()) e.nombre_materia = 'El nombre es obligatorio'
    return e
  }

  // ── Guardar (crear o editar) ─────────────────────────
  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      if (editing) {
        await updateMateria(editing.id_materia, form)
        toast.success('Materia actualizada correctamente')
      } else {
        await createMateria(form)
        toast.success('Materia creada correctamente')
      }
      closeModal()
      load()
    } catch (err) {
      const status = err.response?.status
      if (status === 409) toast.error('Ya existe una materia con esa clave')
      else if (status === 400) toast.error('Datos inválidos. Revisa el formulario')
      else toast.error('Error al guardar la materia')
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar ─────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await deleteMateria(delTarget.id_materia)
      toast.success('Materia eliminada')
      setDelTarget(null)
      if (data.content.length === 1 && page > 0) setPage(page - 1)
      else load()
    } catch (err) {
      toast.error(err.response?.status === 404 ? 'Materia no encontrada' : 'Error al eliminar')
      setDelTarget(null)
    }
  }

  // ── Render ───────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Materias</h1>
        <button className="btn-primary" onClick={openCreate}>+ Nueva materia</button>
      </div>

      {/* Filtro */}
      <div className="toolbar">
        <input
          type="text" placeholder="Buscar por nombre…"
          value={nombre} onChange={handleFilter}
          className="filter-input"
          aria-label="Filtrar materias por nombre"
        />
      </div>

      {/* Tabla */}
      {loading ? <Spinner /> : data.content.length === 0
        ? <EmptyState title="Sin materias" description="Crea la primera materia con el botón de arriba." />
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Clave</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((m) => (
                  <tr key={m.id_materia}>
                    <td>{m.id_materia}</td>
                    <td><code>{m.clave_materia}</code></td>
                    <td>{m.nombre_materia}</td>
                    <td className="actions">
                      <button className="btn-sm btn-secondary" onClick={() => openEdit(m)}>Editar</button>
                      <button className="btn-sm btn-danger"    onClick={() => setDelTarget(m)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination">
              <span className="pag-info">
                {data.totalElements} resultado{data.totalElements !== 1 ? 's' : ''}
              </span>
              <div className="pag-btns">
                <button className="btn-sm btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  ← Anterior
                </button>
                <span className="pag-page">Página {page + 1} de {data.totalPages || 1}</span>
                <button className="btn-sm btn-secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal crear/editar */}
      {showModal && (
        <Modal
          title={editing ? 'Editar materia' : 'Nueva materia'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancelar</button>
              <button className="btn-primary"   onClick={handleSave}  disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear materia'}
              </button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="clave">Clave</label>
            <input
              id="clave" type="text" placeholder="Ej. PROG-01"
              value={form.clave_materia}
              onChange={(e) => { setForm((f) => ({ ...f, clave_materia: e.target.value })); setFormErrors((v) => ({ ...v, clave_materia: undefined })) }}
              aria-invalid={!!formErrors.clave_materia}
            />
            {formErrors.clave_materia && <span className="field-error">{formErrors.clave_materia}</span>}
          </div>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre" type="text" placeholder="Ej. Programación Web"
              value={form.nombre_materia}
              onChange={(e) => { setForm((f) => ({ ...f, nombre_materia: e.target.value })); setFormErrors((v) => ({ ...v, nombre_materia: undefined })) }}
              aria-invalid={!!formErrors.nombre_materia}
            />
            {formErrors.nombre_materia && <span className="field-error">{formErrors.nombre_materia}</span>}
          </div>
        </Modal>
      )}

      {/* Confirmación de borrado */}
      {delTarget && (
        <Confirm
          message={`¿Eliminar la materia "${delTarget.nombre_materia}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}
    </div>
  )
}
