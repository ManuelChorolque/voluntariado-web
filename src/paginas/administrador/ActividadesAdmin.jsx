import { useState, useEffect, useMemo } from 'react';
import { actividadesApi } from '../../servicios/api';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import Boton from '../../componentes/reutilizables/Boton';
import { ESTADOS_ACTIVIDAD } from '../../constantes';

function ActividadesAdmin() {
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalleAct, setDetalleAct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await actividadesApi.obtenerTodos({ pageSize: 200 });
        setActividades(res.data);
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, []);

  const datosFiltrados = useMemo(() => {
    return actividades.filter((a) => {
      if (busqueda && !a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) && !a.nombreOrganizacion?.toLowerCase().includes(busqueda.toLowerCase()))
        return false;
      if (filtroEstado && a.estado !== filtroEstado)
        return false;
      return true;
    });
  }, [actividades, busqueda, filtroEstado]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
  };

  if (cargando) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl text-gray-900">Actividades</h2>
        <p className="m-0 text-sm text-gray-500">{actividades.length} en total</p>
      </div>

      <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Buscar</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[200px]"
            placeholder="Nombre de actividad u organización..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Estado</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[140px]"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(ESTADOS_ACTIVIDAD).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <Boton variante="secundario" onClick={limpiarFiltros}>Limpiar</Boton>
      </div>

      {datosFiltrados.length === 0 ? (
        <p className="text-gray-400">No hay actividades que coincidan con los filtros.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Organización</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ubicación</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Fecha inicio</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Cupos</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 w-20">Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((act) => (
                <tr key={act.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{act.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{act.nombreOrganizacion}</td>
                  <td className="px-4 py-3 text-gray-600">{act.ubicacion}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{new Date(act.fechaInicio).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{act.voluntariosAsignados}/{act.voluntariosRequeridos}</td>
                  <td className="px-4 py-3 text-center"><BadgeEstado estado={act.estado} mapa={ESTADOS_ACTIVIDAD} /></td>
                  <td className="px-4 py-3 text-center">
                    <Boton variante="secundario" onClick={() => setDetalleAct(act)}>Ver</Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalleAct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetalleAct(null)}>
          <div className="bg-white rounded-lg p-7 max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="m-0 text-lg text-gray-900">{detalleAct.nombre}</h3>
              <BadgeEstado estado={detalleAct.estado} mapa={ESTADOS_ACTIVIDAD} />
            </div>
            <p className="m-0 mb-4 text-sm text-gray-600 leading-relaxed">{detalleAct.descripcion}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <span><strong>Organización:</strong> {detalleAct.nombreOrganizacion}</span>
              <span><strong>Ubicación:</strong> {detalleAct.ubicacion}</span>
              <span><strong>Inicio:</strong> {new Date(detalleAct.fechaInicio).toLocaleDateString()}</span>
              <span><strong>Fin:</strong> {new Date(detalleAct.fechaFin).toLocaleDateString()}</span>
              <span><strong>Cupos:</strong> {detalleAct.voluntariosAsignados}/{detalleAct.voluntariosRequeridos}</span>
              {detalleAct.motivoCancelacion && (
                <span className="col-span-2 mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  <strong>Motivo de cancelación:</strong> {detalleAct.motivoCancelacion}
                </span>
              )}
            </div>
            <div className="text-right">
              <Boton variante="secundario" onClick={() => setDetalleAct(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActividadesAdmin;
