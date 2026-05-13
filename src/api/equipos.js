import client from "./client";

export const getEquipos = () =>
  client.get('/api/v1/equipos').then((r) => r.data.content || r.data)

export const createEquipo = (body) =>
  client.post('/api/v1/equipos', body).then((r) => r.data)
