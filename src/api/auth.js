import client from './client'

// POST /auth/login → { token }
export const login = ({ username, password }) =>
  client.post('/auth/login', { username, password }).then((r) => r.data)
