import { useState } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import BadgeEstado from './BadgeEstado';
import Boton from './Boton';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

const S = {
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'box-shadow 0.2s',
    cursor: 'default'
  }
};

function TarjetaActividad({ actividad, modo = 'voluntario', onActualizar, onEditar, onIniciar, onCompletar, ocultarBoton = false }) {
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
      style={S.card}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          {actividad.nombre}
        </h3>
        <BadgeEstado estado={actividad.estado} mapa={ESTADOS_ACTIVIDAD} />
      </div>

      <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: 1.4 }}>
        {actividad.descripcion}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#4b5563' }}>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {actividad.estado === 'Cerrada' && (
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
