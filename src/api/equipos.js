import client from "./client";

//GET /equipos → [{ id, nombre }]
export const getEquipos = () =>
  client.get('/equipos').then((r) => r.data)

//POST /equipos → 201 | 400
//body: { nombre }
export const createEquipo = (body) =>
  client.post('/equipos', body).then((r) => r.data)