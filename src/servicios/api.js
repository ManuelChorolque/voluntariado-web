import axios from 'axios';
import { API_BASE_URL } from '../constantes';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const voluntariosApi = {
  obtenerTodos: () => api.get('/Voluntarios'),
  obtenerPorId: (id) => api.get(`/Voluntarios/${id}`),
  crear: (data) => api.post('/Voluntarios', data),
  actualizar: (id, data) => api.put(`/Voluntarios/${id}`, data),
  eliminar: (id) => api.delete(`/Voluntarios/${id}`),
  reactivar: (id) => api.post(`/Voluntarios/${id}/reactivar`),
  desvincular: (id) => api.post(`/Voluntarios/${id}/desvincular`)
};

export const horasApi = {
  obtenerTodos: () => api.get('/HorasVoluntariado'),
  obtenerPorId: (id) => api.get(`/HorasVoluntariado/${id}`),
  obtenerPorVoluntario: (id) => api.get(`/HorasVoluntariado/voluntario/${id}`),
  registrar: (data) => api.post('/HorasVoluntariado', data),
  eliminar: (id) => api.delete(`/HorasVoluntariado/${id}`),
  obtenerTotalPorVoluntario: (voluntarioId) => api.get(`/HorasVoluntariado/total/${voluntarioId}`)
};

export const certificadosApi = {
  obtenerTodos: () => api.get('/Certificados'),
  obtenerPorId: (id) => api.get(`/Certificados/${id}`),
  obtenerPorVoluntario: (id) => api.get(`/Certificados/voluntario/${id}`),
  obtenerPorOrganizacion: (id) => api.get(`/Certificados/organizacion/${id}`),
  obtenerActividadesPorOrganizacion: (id) => api.get(`/Certificados/organizacion/${id}/actividades`),
  generar: (data) => api.post('/Certificados', data),
  eliminar: (id) => api.delete(`/Certificados/${id}`),
  descargar: (id) => api.post(`/Certificados/${id}/descargar`, {}, { responseType: 'blob' }),
  toggleActivo: (id) => api.patch(`/Certificados/${id}/toggle-activo`),
  toggleActivoActividad: (id) => api.patch(`/Certificados/actividad/${id}/toggle-activo`)
};

export const actividadesApi = {
  obtenerTodos: (params) => api.get('/Actividades', { params }),
  obtenerPorId: (id) => api.get(`/Actividades/${id}`),
  obtenerAbiertas: () => api.get('/Actividades/abiertas'),
  obtenerPorVoluntario: (voluntarioId) => api.get(`/Actividades/voluntario/${voluntarioId}`),
  crear: (data) => api.post('/Actividades', data),
  actualizar: (id, data) => api.put(`/Actividades/${id}`, data),
  eliminar: (id) => api.delete(`/Actividades/${id}`),
  asignarVoluntario: (actividadId, voluntarioId) => api.post(`/Actividades/${actividadId}/voluntario/${voluntarioId}`),
  abrir: (id) => api.post(`/Actividades/${id}/abrir`),
  iniciar: (id) => api.post(`/Actividades/${id}/iniciar`),
  cancelar: (id, motivo) => api.post(`/Actividades/${id}/cancelar`, { motivo }),
  completar: (id) => api.post(`/Actividades/${id}/completar`)
};

export const organizacionesApi = {
  obtenerTodos: () => api.get('/Organizaciones'),
  obtenerPorId: (id) => api.get(`/Organizaciones/${id}`),
  crear: (data) => api.post('/Organizaciones', data),
  registrarConUsuario: (data) => api.post('/Organizaciones/registrar', data),
  actualizar: (id, data) => api.put(`/Organizaciones/${id}`, data),
  eliminar: (id) => api.delete(`/Organizaciones/${id}`),
  reactivar: (id) => api.post(`/Organizaciones/${id}/reactivar`),
  crearUsuarioOrganizacion: (data) => api.post('/Admin/usuarios/organizacion', data)
};

export const adminApi = {
  obtenerUsuarios: (params) => api.get('/Admin/usuarios', { params })
};

export default api;
