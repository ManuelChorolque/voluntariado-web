import { useAuth } from '../contextos/AuthContext';
import DashboardVoluntario from './voluntariado/DashboardVoluntario';
import DashboardOrganizacion from './organizacion/DashboardOrganizacion';
import DashboardAdmin from './administrador/DashboardAdmin';

function Dashboard() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  return (
    <div>
      {usuario.rol === 'Voluntario' && <DashboardVoluntario />}
      {usuario.rol === 'Organizacion' && <DashboardOrganizacion />}
      {usuario.rol === 'Admin' && <DashboardAdmin />}
    </div>
  );
}

export default Dashboard;
