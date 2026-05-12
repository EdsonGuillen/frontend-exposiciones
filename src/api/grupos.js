import client from './client'

export const getGrupos = (params) => client.get('/grupos', { params }).then(r => r.data)
export const createGrupo = (body) => client.post('/grupos', body).then(r => r.data)
export const updateGrupo = (id, body) => client.put(`/grupos/${id}`, body).then(r => r.data)
export const deleteGrupo = (id) => client.delete(`/grupos/${id}`).then(r => r.data)