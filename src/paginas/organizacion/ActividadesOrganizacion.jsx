import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';
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
    ...estiloInput,
    width: 'auto',
    minWidth: '180px'
  },
  inputCorto: {
    ...estiloInput,
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
  },
  grupoBoton: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  }
};

function ActividadesOrganizacion() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [detalleAct, setDetalleAct] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: '', descripcion: '', ubicacion: '',
    fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1
  });
  const [editandoAct, setEditandoAct] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nombre: '', descripcion: '', ubicacion: '',
    fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const params = {};
      if (busqueda) params.busquedaNombre = busqueda;
      if (fechaDesde) params.fechaDesde = new Date(fechaDesde).toISOString();
      if (fechaHasta) params.fechaHasta = new Date(fechaHasta).toISOString();
      const res = await actividadesApi.obtenerTodos(params);
      setActividades(res.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, [busqueda, fechaDesde, fechaHasta]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const crearActividad = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await actividadesApi.crear({
        ...formCrear,
        organizacionId: usuario.organizacionId,
        fechaInicio: new Date(formCrear.fechaInicio).toISOString(),
        fechaFin: new Date(formCrear.fechaFin).toISOString()
      });
      setModalCrear(false);
      setFormCrear({ nombre: '', descripcion: '', ubicacion: '', fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1 });
      cargarDatos();
    } catch { alert('Error al crear actividad'); } finally { setEnviando(false); }
  };

  const abrirEditar = (actividad) => {
    setEditandoAct(actividad);
    setFormEditar({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      ubicacion: actividad.ubicacion,
      fechaInicio: actividad.fechaInicio?.split('T')[0] || '',
      fechaFin: actividad.fechaFin?.split('T')[0] || '',
      voluntariosRequeridos: actividad.voluntariosRequeridos
    });
    setModalEditar(true);
  };

  const guardarEditar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await actividadesApi.actualizar(editandoAct.id, {
        ...formEditar,
        fechaInicio: new Date(formEditar.fechaInicio).toISOString(),
        fechaFin: new Date(formEditar.fechaFin).toISOString()
      });
      setModalEditar(false);
      setEditandoAct(null);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.title || 'Error al actualizar actividad';
      alert(msg);
    } finally { setEnviando(false); }
  };

  const completarActividad = async (actividad) => {
    const totalVoluntarios = detalleAct?.voluntarios?.length ?? actividad.voluntariosAsignados;
    if (!confirm(`¿Completar la actividad "${actividad.nombre}"?\nSe generarán certificados automáticos para los ${totalVoluntarios} voluntarios asignados.`)) return;
    try {
      await actividadesApi.completar(actividad.id);
      setDetalleAct(null);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al completar la actividad';
      alert(msg);
    }
  };

  const cancelarActividad = async (actividad) => {
    if (!confirm(`¿Cancelar la actividad "${actividad.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await actividadesApi.cancelar(actividad.id);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al cancelar la actividad';
      alert(msg);
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await actividadesApi.obtenerPorId(id);
      setDetalleAct(res.data);
    } catch { alert('Error al cargar detalle'); }
  };

  const puedeCancelar = (estado) => !['Completada', 'Cancelada'].includes(estado);
  const puedeEditar = (estado) => !['EnProgreso', 'Completada', 'Cancelada'].includes(estado);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Actividades</h2>
        <Boton onClick={() => setModalCrear(true)}>Crear Actividad</Boton>
      </div>

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
        <Boton variante="secundario" onClick={cargarDatos}>Buscar</Boton>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      ) : actividades.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No se encontraron actividades.</p>
      ) : (
        <table style={S.tabla}>
          <thead>
            <tr>
              <th style={S.th}>Nombre</th>
              <th style={S.th}>Fecha Inicio</th>
              <th style={S.th}>Fecha Fin</th>
              <th style={S.th}>Cupos</th>
              <th style={S.th}>Estado</th>
              <th style={S.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act) => (
              <tr key={act.id}>
                <td style={S.td}>{act.nombre}</td>
                <td style={S.td}>{new Date(act.fechaInicio).toLocaleDateString()}</td>
                <td style={S.td}>{new Date(act.fechaFin).toLocaleDateString()}</td>
                <td style={S.td}>{act.voluntariosAsignados}/{act.voluntariosRequeridos}</td>
                <td style={S.td}><BadgeEstado estado={act.estado} mapa={ESTADOS_ACTIVIDAD} /></td>
                <td style={S.td}>
                  <div style={S.grupoBoton}>
                    <Boton variante="secundario" onClick={() => verDetalle(act.id)}>Ver</Boton>
                    {puedeEditar(act.estado) && (
                      <Boton variante="secundario" onClick={() => abrirEditar(act)}>Editar</Boton>
                    )}
                    {puedeCancelar(act.estado) && (
                      <Boton variante="peligro" onClick={() => cancelarActividad(act)}>Cancelar</Boton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Crear Actividad */}
      <ModalForm abierto={modalCrear} titulo="Crear Actividad" onCerrar={() => setModalCrear(false)} onSubmit={crearActividad} enviando={enviando}>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Nombre</label>
          <input style={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Descripción</label>
          <textarea style={{ ...estiloInput, minHeight: '80px' }} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Ubicación</label>
          <input style={estiloInput} value={formCrear.ubicacion} onChange={(e) => setFormCrear({ ...formCrear, ubicacion: e.target.value })} required />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={estiloLabel}>Fecha inicio</label>
            <input type="date" style={estiloInput} value={formCrear.fechaInicio} onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={estiloLabel}>Fecha fin</label>
            <input type="date" style={estiloInput} value={formCrear.fechaFin} onChange={(e) => setFormCrear({ ...formCrear, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" style={estiloInput} value={formCrear.voluntariosRequeridos} onChange={(e) => setFormCrear({ ...formCrear, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
      </ModalForm>

      {/* Modal Editar Actividad */}
      <ModalForm abierto={modalEditar} titulo="Editar Actividad" onCerrar={() => setModalEditar(false)} onSubmit={guardarEditar} enviando={enviando}>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Nombre</label>
          <input style={estiloInput} value={formEditar.nombre} onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Descripción</label>
          <textarea style={{ ...estiloInput, minHeight: '80px' }} value={formEditar.descripcion} onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Ubicación</label>
          <input style={estiloInput} value={formEditar.ubicacion} onChange={(e) => setFormEditar({ ...formEditar, ubicacion: e.target.value })} required />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={estiloLabel}>Fecha inicio</label>
            <input type="date" style={estiloInput} value={formEditar.fechaInicio} onChange={(e) => setFormEditar({ ...formEditar, fechaInicio: e.target.value })} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={estiloLabel}>Fecha fin</label>
            <input type="date" style={estiloInput} value={formEditar.fechaFin} onChange={(e) => setFormEditar({ ...formEditar, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" style={estiloInput} value={formEditar.voluntariosRequeridos} onChange={(e) => setFormEditar({ ...formEditar, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
      </ModalForm>

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

            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {detalleAct.estado === 'EnProgreso' && (
                <Boton variante="primario" onClick={() => completarActividad(detalleAct)}>Completar y generar certificados</Boton>
              )}
              <Boton variante="secundario" onClick={() => setDetalleAct(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActividadesOrganizacion;
