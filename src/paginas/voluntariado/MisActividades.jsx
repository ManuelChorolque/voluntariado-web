import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

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
      <h2 className="m-0 mb-1 text-lg">Mis Actividades</h2>
      <p className="m-0 mb-6 text-gray-500 text-sm">
        Actividades en las que estás participando
      </p>

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
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="text-gray-500">Cargando...</p>
      ) : actividadesFiltradas.length === 0 ? (
        <p className="text-gray-400">
          {actividades.length === 0
            ? 'No estás participando en ninguna actividad aún.'
            : 'No se encontraron actividades con esos filtros.'}
        </p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Organización</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha Inicio</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha Fin</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody>
            {actividadesFiltradas.map((act) => (
              <tr key={act.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-600">{act.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{act.nombreOrganizacion}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(act.fechaInicio).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(act.fechaFin).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600"><BadgeEstado estado={act.estado} mapa={ESTADOS_ACTIVIDAD} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <Boton variante="secundario" onClick={() => verDetalle(act.id)}>Ver</Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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

            <div className="mt-5 text-right">
              <Boton variante="secundario" onClick={() => setDetalleAct(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisActividades;
