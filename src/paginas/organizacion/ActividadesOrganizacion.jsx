import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

function ActividadesOrganizacion() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

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
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl text-gray-900">Actividades</h2>
        <Boton onClick={() => setModalCrear(true)}>Crear Actividad</Boton>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Buscar por nombre</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[180px]"
            placeholder="Nombre de la actividad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Desde</label>
          <input type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[140px]" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Hasta</label>
          <input type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[140px]" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <Boton variante="secundario" onClick={cargarDatos}>Buscar</Boton>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="text-gray-500">Cargando...</p>
      ) : actividades.length === 0 ? (
        <p className="text-gray-400">No se encontraron actividades.</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha Inicio</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha Fin</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Cupos</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act) => (
              <tr key={act.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-600">{act.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(act.fechaInicio).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(act.fechaFin).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{act.voluntariosAsignados}/{act.voluntariosRequeridos}</td>
                <td className="px-4 py-3 text-sm text-gray-600"><BadgeEstado estado={act.estado} mapa={ESTADOS_ACTIVIDAD} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex gap-1.5 flex-wrap">
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
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Ubicación</label>
          <input className={estiloInput} value={formCrear.ubicacion} onChange={(e) => setFormCrear({ ...formCrear, ubicacion: e.target.value })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Fecha inicio</label>
            <input type="date" className={estiloInput} value={formCrear.fechaInicio} onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Fecha fin</label>
            <input type="date" className={estiloInput} value={formCrear.fechaFin} onChange={(e) => setFormCrear({ ...formCrear, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" className={estiloInput} value={formCrear.voluntariosRequeridos} onChange={(e) => setFormCrear({ ...formCrear, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
      </ModalForm>

      {/* Modal Editar Actividad */}
      <ModalForm abierto={modalEditar} titulo="Editar Actividad" onCerrar={() => setModalEditar(false)} onSubmit={guardarEditar} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={formEditar.nombre} onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={formEditar.descripcion} onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Ubicación</label>
          <input className={estiloInput} value={formEditar.ubicacion} onChange={(e) => setFormEditar({ ...formEditar, ubicacion: e.target.value })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Fecha inicio</label>
            <input type="date" className={estiloInput} value={formEditar.fechaInicio} onChange={(e) => setFormEditar({ ...formEditar, fechaInicio: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Fecha fin</label>
            <input type="date" className={estiloInput} value={formEditar.fechaFin} onChange={(e) => setFormEditar({ ...formEditar, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" className={estiloInput} value={formEditar.voluntariosRequeridos} onChange={(e) => setFormEditar({ ...formEditar, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
      </ModalForm>

      {/* Modal Detalle */}
      {detalleAct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetalleAct(null)}>
          <div className="bg-white rounded-lg p-7 max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="m-0 text-lg text-gray-900">{detalleAct.nombre}</h3>
                <p className="m-0 mt-1 text-sm text-gray-500">{detalleAct.nombreOrganizacion}</p>
              </div>
              <BadgeEstado estado={detalleAct.estado} mapa={ESTADOS_ACTIVIDAD} />
            </div>

            <p className="m-0 mb-4 text-sm text-gray-600 leading-relaxed">{detalleAct.descripcion}</p>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <span><strong>Ubicación:</strong> {detalleAct.ubicacion}</span>
              <span><strong>Inicio:</strong> {new Date(detalleAct.fechaInicio).toLocaleDateString()}</span>
              <span><strong>Fin:</strong> {new Date(detalleAct.fechaFin).toLocaleDateString()}</span>
              <span><strong>Cupos:</strong> {detalleAct.voluntariosAsignados}/{detalleAct.voluntariosRequeridos}</span>
            </div>

            <h4 className="m-0 mb-3 text-sm text-gray-900">
              Voluntarios asignados ({detalleAct.voluntarios?.length ?? 0})
            </h4>

            {(!detalleAct.voluntarios || detalleAct.voluntarios.length === 0) ? (
              <p className="text-gray-400 text-sm">No hay voluntarios asignados.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {detalleAct.voluntarios.map((v) => (
                  <div key={v.id} className="flex justify-between items-center px-3.5 py-2.5 bg-gray-50 rounded-md text-sm">
                    <span className="font-medium">{v.nombreCompleto}</span>
                    <span className="text-gray-500">{v.email}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex gap-2 justify-end">
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
