import { useState, useEffect, useCallback } from 'react';
import { organizacionesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';

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
    } catch { alert('Error al crear organización'); } finally { setEnviando(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl text-gray-900">Organizaciones</h2>
        <Boton onClick={() => setModalCrear(true)}>Nueva Organización</Boton>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando...</p>
      ) : organizaciones.length === 0 ? (
        <p className="text-gray-400">No hay organizaciones registradas.</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Contacto</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Voluntarios</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actividades</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody>
            {organizaciones.map((org) => (
              <tr key={org.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-600">{org.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{org.contacto}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{org.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{org.totalVoluntarios}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{org.totalActividades}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <Boton variante="secundario" onClick={() => setDetalleOrg(org)}>Ver</Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal crear */}
      <ModalForm abierto={modalCrear} titulo="Nueva Organización" onCerrar={() => setModalCrear(false)} onSubmit={crearOrganizacion} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Contacto</label>
          <input className={estiloInput} value={formCrear.contacto} onChange={(e) => setFormCrear({ ...formCrear, contacto: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Email</label>
          <input type="email" className={estiloInput} value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Teléfono</label>
          <input className={estiloInput} value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Dirección</label>
          <input className={estiloInput} value={formCrear.direccion} onChange={(e) => setFormCrear({ ...formCrear, direccion: e.target.value })} />
        </div>
      </ModalForm>

      {/* Modal detalle */}
      {detalleOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetalleOrg(null)}>
          <div className="bg-white rounded-lg p-7 max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-4 text-lg text-gray-900">{detalleOrg.nombre}</h3>
            <p className="m-0 mb-4 text-sm text-gray-600 leading-relaxed">{detalleOrg.descripcion}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <span><strong>Contacto:</strong> {detalleOrg.contacto}</span>
              <span><strong>Email:</strong> {detalleOrg.email}</span>
              <span><strong>Teléfono:</strong> {detalleOrg.telefono || '—'}</span>
              <span><strong>Dirección:</strong> {detalleOrg.direccion || '—'}</span>
              <span><strong>Voluntarios:</strong> {detalleOrg.totalVoluntarios}</span>
              <span><strong>Actividades:</strong> {detalleOrg.totalActividades}</span>
            </div>
            <div className="text-right">
              <Boton variante="secundario" onClick={() => setDetalleOrg(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizacionesAdmin;
