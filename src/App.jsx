import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contextos/AuthContext';
import RutaProtegida from './componentes/RutaProtegida';
import Dashboard from './paginas/Dashboard';
import Voluntarios from './paginas/compartido/Voluntarios';
import Horas from './paginas/compartido/Horas';
import Certificados from './paginas/compartido/Certificados';
import MisCertificados from './paginas/voluntariado/MisCertificados';
import MisActividades from './paginas/voluntariado/MisActividades';
import ActividadesOrganizacion from './paginas/organizacion/ActividadesOrganizacion';
import CertificadosOrganizacion from './paginas/organizacion/CertificadosOrganizacion';
import GestionUsuarios from './paginas/administrador/GestionUsuarios';
import ActividadesAdmin from './paginas/administrador/ActividadesAdmin';
import CertificadosAdmin from './paginas/administrador/CertificadosAdmin';
import Login from './paginas/Login';
import Register from './paginas/Register';

const NAV_MAP = {
  Admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/usuarios', label: 'Usuarios' },
    { to: '/actividades', label: 'Actividades' },
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

function Navegacion() {
  const { usuario, logout } = useAuth();
  const enlaces = NAV_MAP[usuario?.rol] ?? [];

  return (
    <nav className="bg-[#1e3a5f] px-6 py-3 flex gap-5 items-center">
      <span className="text-white font-bold text-lg">Voluntariado</span>
      {enlaces.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `text-sm no-underline px-2 py-1 rounded ${
              isActive ? 'text-blue-300 font-semibold bg-white/10' : 'text-gray-300'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-blue-300 text-sm">
          {usuario?.nombre} {usuario?.apellido}
          <span className="text-gray-400 ml-1.5">({usuario?.rol})</span>
        </span>
        <button
          onClick={logout}
          className="bg-white/10 border-none text-gray-300 px-3.5 py-1.5 rounded cursor-pointer text-sm hover:bg-white/20"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}

function RutasProtegidas() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {usuario?.rol === 'Organizacion' && (
        <>
          <Route path="/actividades" element={<ActividadesOrganizacion />} />
          <Route path="/voluntarios" element={<Voluntarios />} />
          <Route path="/horas" element={<Horas />} />
          <Route path="/certificados" element={<CertificadosOrganizacion />} />
        </>
      )}

      {usuario?.rol === 'Admin' && (
        <>
          <Route path="/usuarios" element={<GestionUsuarios />} />
          <Route path="/actividades" element={<ActividadesAdmin />} />
          <Route path="/certificados" element={<CertificadosAdmin />} />
        </>
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
    <div className="min-h-screen bg-gray-100">
      {usuario && <Navegacion />}
      <main className="p-6 max-w-[1200px] mx-auto">
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
