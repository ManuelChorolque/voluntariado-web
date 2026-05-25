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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '400px', maxWidth: '90%' }}>
        <h1 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: '24px' }}>Voluntariado</h1>
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>Inicia sesion para continuar</p>

        {error && (
          <p style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
        )}

        <form onSubmit={manejarSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <Boton tipo="submit" deshabilitado={cargando} style={{ width: '100%' }}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesion'}
          </Boton>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          ¿No tenes cuenta?{' '}
          <Link to="/registrar" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
