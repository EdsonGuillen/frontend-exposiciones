import client from './client'

// GET /materias?page=0&size=10&nombre=...
export const getMaterias = ({ page = 0, size = 10, nombre = '' } = {}) =>
  client.get('/materias', { params: { page, size, ...(nombre && { nombre }) } }).then((r) => r.data)

// GET /materias/:id
export const getMateria = (id) =>
  client.get(`/materias/${id}`).then((r) => r.data)

// POST /materias  → 201 Materia | 400 | 409
export const createMateria = (body) =>
  client.post('/materias', body).then((r) => r.data)

// PUT /materias/:id → 200 | 404
export const updateMateria = (id, body) =>
  client.put(`/materias/${id}`, body).then((r) => r.data)

// DELETE /materias/:id → 204 | 404
export const deleteMateria = (id) =>
  client.delete(`/materias/${id}`)
