import { useState, useEffect } from 'react'
import { getEquipos, createEquipo } from '../api/equipos'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

const EMPTY_FORM = { nombre: '' }

export default function Equipos() {
  const toast = useToast()
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [nombre,     setNombre]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const equipos = await getEquipos()
      setData(equipos)
    } catch {
      toast.error('Error al cargar los equipos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const filteredEquipos = data.filter((e) =>
    e.nombre?.toLowerCase().includes(nombre.toLowerCase())
  )

  const handleSave = async () => {
    if (!form.nombre.trim()) { setFormErrors({ nombre: 'El nombre es obligatorio' }); return }
    setSaving(true)
    try {
      await createEquipo({ nombre: form.nombre.trim() })
      toast.success('Equipo creado correctamente')
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      const status = err.response?.status
      if (status === 409) toast.error('Ya existe un equipo con ese nombre')
      else toast.error('Error al guardar el equipo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Equipos</h1>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }}>
          + Nuevo equipo
        </button>
      </div>

      <div className="toolbar">
        <input type="text" placeholder="Buscar por nombre..." value={nombre}
          onChange={(e) => setNombre(e.target.value)} className="filter-input" />
      </div>

      {loading ? <Spinner /> : filteredEquipos.length === 0
        ? <EmptyState title={data.length === 0 ? 'Sin equipos' : 'Sin resultados'} description="Crea el primer equipo." />
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Nombre</th><th>Grupo</th></tr></thead>
              <tbody>
                {filteredEquipos.map((e) => (
                  <tr key={e.id_equipo}>
                    <td>{e.id_equipo}</td>
                    <td>{e.nombre}</td>
                    <td>{e.nombre_grupo || '—'}</td>
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
                {saving ? 'Guardando…' : 'Crear equipo'}
              </button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="eq-nombre">Nombre</label>
            <input id="eq-nombre" type="text" value={form.nombre}
              onChange={(e) => { setForm({ nombre: e.target.value }); setFormErrors({}) }}
              aria-invalid={!!formErrors.nombre} />
            {formErrors.nombre && <span className="field-error">{formErrors.nombre}</span>}
          </div>
        </Modal>
      )}
    </div>
  )
}
