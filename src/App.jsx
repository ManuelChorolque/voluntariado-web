import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contextos/AuthContext';
import RutaProtegida from './componentes/RutaProtegida';
import Dashboard from './paginas/Dashboard';
import Voluntarios from './paginas/Voluntarios';
import Horas from './paginas/Horas';
import Certificados from './paginas/Certificados';
import MisCertificados from './paginas/MisCertificados';
import MisActividades from './paginas/voluntariado/MisActividades';
import ActividadesOrganizacion from './paginas/organizacion/ActividadesOrganizacion';
import OrganizacionesAdmin from './paginas/administrador/OrganizacionesAdmin';
import Login from './paginas/Login';
import Register from './paginas/Register';

const NAV_MAP = {
  Admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/actividades', label: 'Actividades' },
    { to: '/organizaciones', label: 'Organizaciones' },
    { to: '/voluntarios', label: 'Voluntarios' },
    { to: '/horas', label: 'Horas' },
    { to: '/certificados', label: 'Certificados' }
  ],
  Organizacion: [
    { to: '/', label: 'Dashboard' },
    { to: '/actividades', label: 'Actividades' },
    { to: '/voluntarios', label: 'Voluntarios' },
    { to: '/horas', label: 'Horas' },
    { to: '/certificados', label: 'Certificados' }
  ],
  Voluntario: [
    { to: '/', label: 'Dashboard' },
    { to: '/mis-actividades', label: 'Mis Actividades' },
    { to: '/mis-certificados', label: 'Mis Certificados' }
  ]
};

const ROLES_CON_CRUD = ['Admin', 'Organizacion'];

function Navegacion() {
  const { usuario, logout } = useAuth();
  const enlaces = NAV_MAP[usuario?.rol] ?? [];

  return (
    <nav style={{ background: '#1e3a5f', padding: '12px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>Voluntariado</span>
      {enlaces.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            color: isActive ? '#93c5fd' : '#cbd5e1',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 400,
            padding: '4px 8px',
            borderRadius: '4px',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
          })}
        >
          {label}
        </NavLink>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#93c5fd', fontSize: '13px' }}>
          {usuario?.nombre} {usuario?.apellido}
          <span style={{ color: '#6b8cae', marginLeft: '6px' }}>({usuario?.rol})</span>
        </span>
        <button
          onClick={logout}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}

function RutasProtegidas() {
  const { usuario } = useAuth();
  const esAdminOrONG = ROLES_CON_CRUD.includes(usuario?.rol);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {esAdminOrONG && (
        <>
          <Route path="/actividades" element={<ActividadesOrganizacion />} />
          <Route path="/voluntarios" element={<Voluntarios />} />
          <Route path="/horas" element={<Horas />} />
          <Route path="/certificados" element={<Certificados />} />
        </>
      )}

      {usuario?.rol === 'Admin' && (
        <Route path="/organizaciones" element={<OrganizacionesAdmin />} />
      )}

      {usuario?.rol === 'Voluntario' && (
        <>
          <Route path="/mis-actividades" element={<MisActividades />} />
          <Route path="/mis-certificados" element={<MisCertificados />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppLayout() {
  const { usuario } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {usuario && <Navegacion />}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Register />} />
          <Route
            path="/*"
            element={
              <RutaProtegida>
                <RutasProtegidas />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
