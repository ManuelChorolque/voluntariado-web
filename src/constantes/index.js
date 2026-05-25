export const API_BASE_URL = 'https://localhost:7000/api';

export const ESTADOS_VOLUNTARIO = {
  Activo: { label: 'Activo', color: '#22c55e' },
  Inactivo: { label: 'Inactivo', color: '#9ca3af' },
  Suspendido: { label: 'Suspendido', color: '#f59e0b' },
  Retirado: { label: 'Retirado', color: '#ef4444' }
};

export const ESTADOS_CERTIFICADO = {
  Generado: { label: 'Generado', color: '#3b82f6' },
  Descargado: { label: 'Descargado', color: '#22c55e' },
  Revocado: { label: 'Revocado', color: '#ef4444' }
};

export const PAGINACION = {
  TAMANO_PAGINA: 10,
  PAGINA_INICIAL: 1
};

export const ESTADOS_ACTIVIDAD = {
  Planificada: { label: 'Planificada', color: '#9ca3af' },
  Abierta: { label: 'Abierta', color: '#22c55e' },
  EnProgreso: { label: 'En Progreso', color: '#3b82f6' },
  Completada: { label: 'Completada', color: '#8b5cf6' },
  Cancelada: { label: 'Cancelada', color: '#ef4444' },
  Cerrada: { label: 'Cerrada', color: '#f59e0b' }
};

export const MENSAJES = {
  CONFIRMAR_ELIMINAR: '¿Estás seguro de eliminar este registro?',
  ERROR_CARGA: 'Error al cargar los datos',
  SIN_REGISTROS: 'No se encontraron registros',
  OPERACION_EXITOSA: 'Operación realizada con éxito'
};
