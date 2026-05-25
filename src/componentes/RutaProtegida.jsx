import { Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;
