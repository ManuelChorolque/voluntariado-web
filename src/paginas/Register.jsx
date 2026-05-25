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

  const estiloInput = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '400px', maxWidth: '90%' }}>
        <h1 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: '24px' }}>Crear cuenta</h1>
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>Unite a la red de voluntariado</p>

        {error && (
          <p style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
        )}

        <form onSubmit={manejarSubmit}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Nombre</label>
              <input style={estiloInput} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Apellido</label>
              <input style={estiloInput} value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input type="email" style={estiloInput} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Contrasena</label>
            <input type="password" style={estiloInput} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: 500 }}>Tipo de cuenta</label>
            <select style={estiloInput} value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="Voluntario">Voluntario</option>
              <option value="Organizacion">Organizacion (ONG)</option>
            </select>
          </div>

          <Boton tipo="submit" deshabilitado={cargando} style={{ width: '100%' }}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </Boton>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          ¿Ya tenes cuenta?{' '}
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
