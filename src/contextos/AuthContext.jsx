import { createContext, useContext, useState, useEffect } from 'react';
import api from '../servicios/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const datos = localStorage.getItem('usuario');
    if (token && datos) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUsuario(JSON.parse(datos));
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const respuesta = await api.post('/Auth/login', { email, password });
    const { token, ...datos } = respuesta.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datos));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(datos);
    return datos;
  };

  const registrar = async (datos) => {
    const respuesta = await api.post('/Auth/registrar', datos);
    const { token, ...usuarioData } = respuesta.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(usuarioData);
    return usuarioData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
