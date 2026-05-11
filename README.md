# Frontend — Sistema de Exposiciones

React + Vite · API base: `http://localhost:8080/api/v1`

## Instalación

```bash
git clone <url-del-repo>
cd frontend-exposiciones
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

## Estructura

```
src/
├── api/              # Clientes HTTP (axios)
│   ├── client.js     # Interceptor JWT + 401
│   ├── auth.js
│   ├── materias.js   # CRUD completo
│   └── evaluaciones.js
├── components/
│   ├── ui/           # Modal, Confirm, Spinner, EmptyState
│   ├── MainLayout.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx   # Login / logout / JWT
│   └── ToastContext.jsx  # Notificaciones globales
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Materias.jsx      # Tabla paginada + CRUD + filtros
    ├── Evaluaciones.jsx  # Rúbrica dinámica
    └── Grupos / Alumnos / Equipos / Exposiciones (placeholders)
```

## Distribución del equipo (3 integrantes)

| Integrante | Rama             | Responsabilidad                                     |
|------------|------------------|-----------------------------------------------------|
| M1         | feature/auth-layout   | Login, AuthContext, ToastContext, Sidebar, Navbar, ProtectedRoute |
| M2         | feature/materias      | Tabla paginada, filtros, CRUD completo, manejo 400/409 |
| M3         | feature/eval-pages    | Evaluaciones rúbrica dinámica + Grupos, Alumnos, Equipos, Exposiciones |

## Estrategia de ramas

```
main
 └── develop
      ├── feature/auth-layout
      ├── feature/materias
      └── feature/eval-pages
```

Flujo: `feature/X` → PR → `develop` → PR → `main`

## Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
style:    cambios visuales / CSS
refactor: reestructurar sin cambiar funcionalidad
chore:    config, dependencias, setup
```

Ejemplo: `feat: agregar tabla paginada de materias`

## Versiones

| Tag    | Descripción                         |
|--------|-------------------------------------|
| v0.1.0 | Setup + Login + Layout              |
| v0.2.0 | CRUD Materias completo              |
| v0.3.0 | Evaluaciones con rúbrica            |
| v1.0.0 | Entrega final todas las páginas     |
