import { useState } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import BadgeEstado from './BadgeEstado';
import Boton from './Boton';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

function TarjetaActividad({ actividad, modo = 'voluntario', onActualizar, onEditar, onIniciar, onCompletar, onAbrir, ocultarBoton = false }) {
  const { usuario } = useAuth();
  const [postulando, setPostulando] = useState(false);

  const postular = async () => {
    if (!usuario.voluntarioId) return;
    setPostulando(true);
    try {
      await actividadesApi.asignarVoluntario(actividad.id, usuario.voluntarioId);
      if (onActualizar) onActualizar();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.title || 'Error al postular. Intentalo de nuevo.';
      alert(msg);
    } finally {
      setPostulando(false);
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-5 bg-white flex flex-col gap-3 transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <h3 className="m-0 text-base font-semibold text-gray-900">
          {actividad.nombre}
        </h3>
        <BadgeEstado estado={actividad.estado} mapa={ESTADOS_ACTIVIDAD} />
      </div>

      <p className="m-0 text-gray-500 text-sm leading-relaxed">
        {actividad.descripcion}
      </p>

      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <span><strong>Organización:</strong> {actividad.nombreOrganizacion}</span>
        <span><strong>Ubicación:</strong> {actividad.ubicacion}</span>
        <span><strong>Fecha:</strong> {new Date(actividad.fechaInicio).toLocaleDateString()} — {new Date(actividad.fechaFin).toLocaleDateString()}</span>
        <span><strong>Cupos:</strong> {actividad.voluntariosAsignados}/{actividad.voluntariosRequeridos}</span>
      </div>

      {modo === 'voluntario' && actividad.estado === 'Abierta' && !ocultarBoton && (
        <Boton
          variante="primario"
          onClick={postular}
          deshabilitado={postulando || actividad.voluntariosAsignados >= actividad.voluntariosRequeridos || !usuario.voluntarioId}
        >
          {postulando ? 'Postulando...' :
           actividad.voluntariosAsignados >= actividad.voluntariosRequeridos ? 'Completo' : 'Postular'}
        </Boton>
      )}

      {modo === 'ong' && (
        <div className="flex gap-2">
          {actividad.estado === 'Planificada' && (
            <Boton variante="primario" onClick={() => onAbrir?.(actividad)}>Abrir inscripciones</Boton>
          )}
          {actividad.estado === 'Abierta' && (
            <Boton variante="primario" onClick={() => onIniciar?.(actividad)}>Iniciar</Boton>
          )}
          {actividad.estado === 'EnProgreso' && (
            <Boton variante="primario" onClick={() => onCompletar?.(actividad)}>Completar</Boton>
          )}
          <Boton variante="secundario" onClick={() => onEditar?.(actividad)}>Editar</Boton>
        </div>
      )}
    </div>
  );
}

export default TarjetaActividad;
