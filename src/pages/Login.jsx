import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'El usuario es obligatorio'
    if (!form.password.trim()) e.password = 'La contraseña es obligatoria'
    return e
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((v) => ({ ...v, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const ok = await login(form)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📋</div>
        <h1 className="login-title">Sistema de Exposiciones</h1>
        <p className="login-sub">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username" name="username" type="text"
              placeholder="Ej. alumno1"
              value={form.username} onChange={handleChange}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'err-user' : undefined}
              autoComplete="username"
            />
            {errors.username && <span id="err-user" className="field-error" role="alert">{errors.username}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password"
              placeholder="••••••"
              value={form.password} onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'err-pass' : undefined}
              autoComplete="current-password"
            />
            {errors.password && <span id="err-pass" className="field-error" role="alert">{errors.password}</span>}
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
