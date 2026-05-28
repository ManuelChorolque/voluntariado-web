import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import Boton from '../componentes/reutilizables/Boton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesion');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-sm w-[400px] max-w-[90%]">
        <h1 className="m-0 mb-1 text-[#1e3a5f] text-2xl font-bold">Voluntariado</h1>
        <p className="m-0 mb-6 text-gray-500 text-sm">Inicia sesion para continuar</p>

        {error && (
          <p className="bg-red-50 text-red-600 p-2.5 rounded-md text-sm mb-4">{error}</p>
        )}

        <form onSubmit={manejarSubmit}>
          <div className="mb-4">
            <label className="block mb-1.5 text-gray-700 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1.5 text-gray-700 text-sm font-medium">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <Boton tipo="submit" deshabilitado={cargando} className="w-full">
            {cargando ? 'Ingresando...' : 'Iniciar Sesion'}
          </Boton>
        </form>

        <p className="mt-5 text-center text-gray-500 text-sm">
          ¿No tenes cuenta?{' '}
          <Link to="/registrar" className="text-blue-500 no-underline font-medium">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
