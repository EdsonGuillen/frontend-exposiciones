import client from "./client";

export const getEquipos = () =>
  client.get('/equipos').then((r) => r.data.content || r.data)

export const createEquipo = (body) =>
  client.post('/equipos', body).then((r) => r.data)
