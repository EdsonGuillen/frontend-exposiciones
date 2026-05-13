import { useState, useEffect, useCallback } from 'react'

import {
  getEquipos,
  createEquipo
} from '../api/equipos'

import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

const EMPTY_FORM = {
  nombre: ''
}

export default function Equipos() {

  const toast = useToast()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const loadEquipos = useCallback(async () => {
    setLoading(true)

    try {
      const equipos = await getEquipos()
      setData(equipos)
    } catch {
      toast.error('Error al cargar los equipos')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadEquipos()
  }, [loadEquipos, refreshKey])

  const filteredEquipos = data.filter((equipo) =>
    equipo.nombre?.toLowerCase().includes(nombre.toLowerCase())
  )

  const handleFilter = (e) => {
    setNombre(e.target.value)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormErrors({})
  }

  const validate = () => {
    const errors = {}

    if (!form.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio'
    }

    return errors
  }

  const handleSave = async () => {
    const errors = validate()

    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    setSaving(true)

    try {
      await createEquipo({ nombre: form.nombre.trim() })
      toast.success('Equipo creado correctamente')
      closeModal()
      setRefreshKey((current) => current + 1)
    } catch (err) {
      const status = err.response?.status

      if (status === 409) {
        toast.error('Ya existe un equipo con ese nombre')
      } else if (status === 400) {
        toast.error('Datos inválidos')
      } else {
        toast.error('Error al guardar el equipo')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>

      <div className="page-header">
        <h1 className="page-title">Equipos</h1>

        <button
          className="btn-primary"
          onClick={openCreate}
        >
          + Nuevo equipo
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={nombre}
          onChange={handleFilter}
          className="filter-input"
        />
      </div>

      {
        loading
          ? <Spinner />
          : filteredEquipos.length === 0
            ? (
              <EmptyState
                title={data.length === 0 ? 'Sin equipos' : 'Sin resultados'}
                description={data.length === 0 ? 'Crea el primer equipo.' : 'No se encontraron equipos con ese nombre.'}
              />
            )
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      filteredEquipos.map((equipo) => (
                        <tr key={equipo.id}>
                          <td>{equipo.id}</td>
                          <td>{equipo.nombre}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )
      }

      {
        showModal && (
          <Modal
            title="Nuevo equipo"
            onClose={closeModal}
            footer={(
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
                  {saving ? 'Guardando...' : 'Crear equipo'}
                </button>
              </>
            )}
          >
            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ nombre: e.target.value })}
              />
              {formErrors.nombre && (
                <span className="field-error">{formErrors.nombre}</span>
              )}
            </div>
          </Modal>
        )
      }

    </div>
  )
}
