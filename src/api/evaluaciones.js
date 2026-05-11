import client from './client'

// POST /evaluaciones → 201 | 400 | 409
// body: { id_exposicion, id_alumno_evaluador, detalles: [{ id_criterio, calificacion }] }
export const createEvaluacion = (body) =>
  client.post('/evaluaciones', body).then((r) => r.data)
