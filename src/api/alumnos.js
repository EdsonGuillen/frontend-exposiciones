import client from './client'

// GET /alumnos?page=0&size=10&nombre=...
export const getAlumnos = ({ page = 0, size = 10, nombre = '' } = {}) =>
  client.get('/alumnos', { params: { page, size, ...(nombre && { nombre }) } }).then((r) => r.data)

// GET /alumnos/:id
export const getAlumno = (id) =>
  client.get(`/alumnos/${id}`).then((r) => r.data)

// POST /alumnos  → 201 Alumno | 400 | 409
export const createAlumno = (body) =>
  client.post('/alumnos', body).then((r) => r.data)

// PUT /alumnos/:id → 200 | 404
export const updateAlumno = (id, body) =>
  client.put(`/alumnos/${id}`, body).then((r) => r.data)

// DELETE /alumnos/:id → 204 | 404
export const deleteAlumno = (id) =>
  client.delete(`/alumnos/${id}`)