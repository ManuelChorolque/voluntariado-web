import { Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <p className="text-center py-10 text-gray-500">Cargando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
