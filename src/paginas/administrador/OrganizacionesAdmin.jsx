import { useState, useEffect, useCallback } from 'react';
import { organizacionesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';

const S = {
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
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  }
};

function OrganizacionesAdmin() {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detalleOrg, setDetalleOrg] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: '', descripcion: '', contacto: '', email: '', telefono: '', direccion: ''
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await organizacionesApi.obtenerTodos();
      setOrganizaciones(res.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const crearOrganizacion = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await organizacionesApi.crear(formCrear);
      setModalCrear(false);
      setFormCrear({ nombre: '', descripcion: '', contacto: '', email: '', telefono: '', direccion: '' });
      cargarDatos();
    } catch { alert('Error al crear organizaci\u00f3n'); } finally { setEnviando(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Organizaciones</h2>
        <Boton onClick={() => setModalCrear(true)}>Nueva Organización</Boton>
      </div>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      ) : organizaciones.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No hay organizaciones registradas.</p>
      ) : (
        <table style={S.tabla}>
          <thead>
            <tr>
              <th style={S.th}>Nombre</th>
              <th style={S.th}>Contacto</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Voluntarios</th>
              <th style={S.th}>Actividades</th>
              <th style={S.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {organizaciones.map((org) => (
              <tr key={org.id}>
                <td style={S.td}>{org.nombre}</td>
                <td style={S.td}>{org.contacto}</td>
                <td style={S.td}>{org.email}</td>
                <td style={S.td}>{org.totalVoluntarios}</td>
                <td style={S.td}>{org.totalActividades}</td>
                <td style={S.td}>
                  <Boton variante="secundario" onClick={() => setDetalleOrg(org)}>Ver</Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal crear */}
      <ModalForm abierto={modalCrear} titulo="Nueva Organización" onCerrar={() => setModalCrear(false)} onSubmit={crearOrganizacion} enviando={enviando}>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Nombre</label>
          <input style={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Descripción</label>
          <textarea style={{ ...estiloInput, minHeight: '80px' }} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Contacto</label>
          <input style={estiloInput} value={formCrear.contacto} onChange={(e) => setFormCrear({ ...formCrear, contacto: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Email</label>
          <input type="email" style={estiloInput} value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Teléfono</label>
          <input style={estiloInput} value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={estiloLabel}>Dirección</label>
          <input style={estiloInput} value={formCrear.direccion} onChange={(e) => setFormCrear({ ...formCrear, direccion: e.target.value })} />
        </div>
      </ModalForm>

      {/* Modal detalle */}
      {detalleOrg && (
        <div style={S.detalleOverlay} onClick={() => setDetalleOrg(null)}>
          <div style={S.detalleCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111827' }}>{detalleOrg.nombre}</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>{detalleOrg.descripcion}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              <span><strong>Contacto:</strong> {detalleOrg.contacto}</span>
              <span><strong>Email:</strong> {detalleOrg.email}</span>
              <span><strong>Teléfono:</strong> {detalleOrg.telefono || '—'}</span>
              <span><strong>Dirección:</strong> {detalleOrg.direccion || '—'}</span>
              <span><strong>Voluntarios:</strong> {detalleOrg.totalVoluntarios}</span>
              <span><strong>Actividades:</strong> {detalleOrg.totalActividades}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Boton variante="secundario" onClick={() => setDetalleOrg(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizacionesAdmin;
