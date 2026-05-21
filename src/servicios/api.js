import axios from 'axios';
import { API_BASE_URL } from '../constantes';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const voluntariosApi = {
  obtenerTodos: () => api.get('/Voluntarios'),
  obtenerPorId: (id) => api.get(`/Voluntarios/${id}`),
  crear: (data) => api.post('/Voluntarios', data),
  actualizar: (id, data) => api.put(`/Voluntarios/${id}`, data),
  eliminar: (id) => api.delete(`/Voluntarios/${id}`)
};

export const horasApi = {
  obtenerTodos: () => api.get('/HorasVoluntariado'),
  obtenerPorId: (id) => api.get(`/HorasVoluntariado/${id}`),
  registrar: (data) => api.post('/HorasVoluntariado', data),
  eliminar: (id) => api.delete(`/HorasVoluntariado/${id}`),
  obtenerTotalPorVoluntario: (voluntarioId) => api.get(`/HorasVoluntariado/total/${voluntarioId}`)
};

export const certificadosApi = {
  obtenerTodos: () => api.get('/Certificados'),
  obtenerPorId: (id) => api.get(`/Certificados/${id}`),
  generar: (data) => api.post('/Certificados', data),
  eliminar: (id) => api.delete(`/Certificados/${id}`),
  descargar: (id) => api.post(`/Certificados/${id}/descargar`, {}, { responseType: 'blob' })
};

export default api;
