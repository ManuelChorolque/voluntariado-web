import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import Boton from '../componentes/reutilizables/Boton';

function Register() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'Voluntario' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await registrar(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-sm w-[400px] max-w-[90%]">
        <h1 className="m-0 mb-1 text-[#1e3a5f] text-2xl font-bold">Crear cuenta</h1>
        <p className="m-0 mb-6 text-gray-500 text-sm">Unite a la red de voluntariado</p>

        {error && (
          <p className="bg-red-50 text-red-600 p-2.5 rounded-md text-sm mb-4">{error}</p>
        )}

        <form onSubmit={manejarSubmit}>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block mb-1.5 text-gray-700 text-sm font-medium">Nombre</label>
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1.5 text-gray-700 text-sm font-medium">Apellido</label>
              <input
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-gray-700 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1.5 text-gray-700 text-sm font-medium">Contrasena</label>
            <input
              type="password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1.5 text-gray-700 text-sm font-medium">Tipo de cuenta</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="Voluntario">Voluntario</option>
              <option value="Organizacion">Organizacion (ONG)</option>
            </select>
          </div>

          <Boton tipo="submit" deshabilitado={cargando} className="w-full">
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </Boton>
        </form>

        <p className="mt-5 text-center text-gray-500 text-sm">
          ¿Ya tenes cuenta?{' '}
          <Link to="/login" className="text-blue-500 no-underline font-medium">Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
