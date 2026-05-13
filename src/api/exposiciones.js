import client from "./client";

//GET /exposiciones → [{ id, titulo, descripcion, fecha, id_alumno }]
export const getExposiciones = () =>
  client.get('/exposiciones').then((r) => r.data)

//POST /exposiciones → 201 | 400
//body: { titulo, descripcion, fecha, id_alumno }
export const createExposicion = (body) =>
  client.post('/exposiciones', body).then((r) => r.data)    