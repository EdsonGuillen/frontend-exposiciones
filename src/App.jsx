import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }   from './context/AuthContext'
import { ToastProvider }  from './context/ToastContext'
import ProtectedRoute     from './components/ProtectedRoute'
import MainLayout         from './components/MainLayout'

import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Materias     from './pages/Materias'
import Grupos       from './pages/Grupos'
import Alumnos      from './pages/Alumnos'
import Equipos      from './pages/Equipos'
import Exposiciones from './pages/Exposiciones'
import Evaluaciones from './pages/Evaluaciones'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas bajo el layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="materias"     element={<Materias />} />
              <Route path="grupos"       element={<Grupos />} />
              <Route path="alumnos"      element={<Alumnos />} />
              <Route path="equipos"      element={<Equipos />} />
              <Route path="exposiciones" element={<Exposiciones />} />
              <Route path="evaluaciones" element={<Evaluaciones />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
