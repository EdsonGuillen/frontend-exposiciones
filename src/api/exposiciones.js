import client from "./client";

export const getExposiciones = () =>
  client.get('/exposiciones').then((r) => r.data.content || r.data)

export const createExposicion = (body) =>
  client.post('/exposiciones', body).then((r) => r.data)
