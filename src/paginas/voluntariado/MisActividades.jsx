import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

const S = {
  filtros: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '20px',
    padding: '16px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  grupoFiltro: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151'
  },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    background: '#fff',
    width: 'auto',
    minWidth: '180px'
  },
  inputCorto: {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    background: '#fff',
    width: 'auto',
    minWidth: '140px'
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },
  th: {
    background: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    borderBottom: '2px solid #e5e7eb'
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#4b5563',
    borderBottom: '1px solid #f3f4f6'
  },
  detalleOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  detalleCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '28px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  voluntarioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#f9fafb',
    borderRadius: '6px',
    fontSize: '13px'
  }
};

function MisActividades() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [detalleAct, setDetalleAct] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!usuario.voluntarioId) return;
    setCargando(true);
    try {
      const res = await actividadesApi.obtenerPorVoluntario(usuario.voluntarioId);
      setActividades(res.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, [usuario.voluntarioId]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const actividadesFiltradas = useMemo(() => {
    return actividades.filter((act) => {
      if (busqueda && !act.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        return false;
      if (fechaDesde && new Date(act.fechaInicio) < new Date(fechaDesde))
        return false;
      if (fechaHasta && new Date(act.fechaFin) > new Date(fechaHasta + 'T23:59:59'))
        return false;
      return true;
    });
  }, [actividades, busqueda, fechaDesde, fechaHasta]);

  const verDetalle = async (id) => {
    try {
      const res = await actividadesApi.obtenerPorId(id);
      setDetalleAct(res.data);
    } catch { alert('Error al cargar detalle'); }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>Mis Actividades</h2>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>
        Actividades en las que estás participando
      </p>

      {/* Filtros */}
      <div style={S.filtros}>
        <div style={S.grupoFiltro}>
          <label style={S.label}>Buscar por nombre</label>
          <input
            style={S.input}
            placeholder="Nombre de la actividad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div style={S.grupoFiltro}>
          <label style={S.label}>Desde</label>
          <input type="date" style={S.inputCorto} value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div style={S.grupoFiltro}>
          <label style={S.label}>Hasta</label>
          <input type="date" style={S.inputCorto} value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      ) : actividadesFiltradas.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>
          {actividades.length === 0
            ? 'No estás participando en ninguna actividad aún.'
            : 'No se encontraron actividades con esos filtros.'}
        </p>
      ) : (
        <table style={S.tabla}>
          <thead>
            <tr>
              <th style={S.th}>Nombre</th>
              <th style={S.th}>Organización</th>
              <th style={S.th}>Fecha Inicio</th>
              <th style={S.th}>Fecha Fin</th>
              <th style={S.th}>Estado</th>
              <th style={S.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {actividadesFiltradas.map((act) => (
              <tr key={act.id}>
                <td style={S.td}>{act.nombre}</td>
                <td style={S.td}>{act.nombreOrganizacion}</td>
                <td style={S.td}>{new Date(act.fechaInicio).toLocaleDateString()}</td>
                <td style={S.td}>{new Date(act.fechaFin).toLocaleDateString()}</td>
                <td style={S.td}><BadgeEstado estado={act.estado} mapa={ESTADOS_ACTIVIDAD} /></td>
                <td style={S.td}>
                  <Boton variante="secundario" onClick={() => verDetalle(act.id)}>Ver</Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Detalle */}
      {detalleAct && (
        <div style={S.detalleOverlay} onClick={() => setDetalleAct(null)}>
          <div style={S.detalleCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{detalleAct.nombre}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{detalleAct.nombreOrganizacion}</p>
              </div>
              <BadgeEstado estado={detalleAct.estado} mapa={ESTADOS_ACTIVIDAD} />
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>{detalleAct.descripcion}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              <span><strong>Ubicación:</strong> {detalleAct.ubicacion}</span>
              <span><strong>Inicio:</strong> {new Date(detalleAct.fechaInicio).toLocaleDateString()}</span>
              <span><strong>Fin:</strong> {new Date(detalleAct.fechaFin).toLocaleDateString()}</span>
              <span><strong>Cupos:</strong> {detalleAct.voluntariosAsignados}/{detalleAct.voluntariosRequeridos}</span>
            </div>

            <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#111827' }}>
              Voluntarios asignados ({detalleAct.voluntarios?.length ?? 0})
            </h4>

            {(!detalleAct.voluntarios || detalleAct.voluntarios.length === 0) ? (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>No hay voluntarios asignados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {detalleAct.voluntarios.map((v) => (
                  <div key={v.id} style={S.voluntarioItem}>
                    <span style={{ fontWeight: 500 }}>{v.nombreCompleto}</span>
                    <span style={{ color: '#6b7280' }}>{v.email}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Boton variante="secundario" onClick={() => setDetalleAct(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisActividades;
