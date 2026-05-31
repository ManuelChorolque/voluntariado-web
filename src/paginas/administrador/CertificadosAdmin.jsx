import { useState, useEffect, useMemo } from 'react';
import { certificadosApi } from '../../servicios/api';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import Boton from '../../componentes/reutilizables/Boton';
import { ESTADOS_CERTIFICADO } from '../../constantes';

function CertificadosAdmin() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await certificadosApi.obtenerTodos();
        setDatos(res.data);
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, []);

  const datosFiltrados = useMemo(() => {
    return datos.filter((c) => {
      if (busqueda && !c.nombreVoluntario?.toLowerCase().includes(busqueda.toLowerCase()) && !c.nombreActividad?.toLowerCase().includes(busqueda.toLowerCase()))
        return false;
      if (fechaDesde && new Date(c.fechaEmision) < new Date(fechaDesde))
        return false;
      if (fechaHasta && new Date(c.fechaEmision) > new Date(fechaHasta + 'T23:59:59'))
        return false;
      return true;
    });
  }, [datos, busqueda, fechaDesde, fechaHasta]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const descargarCertificado = async (id) => {
    try {
      const respuesta = await certificadosApi.descargar(id);
      const url = window.URL.createObjectURL(new Blob([respuesta.data]));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.setAttribute('download', `certificado-${id}.pdf`);
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      window.URL.revokeObjectURL(url);
    } catch { alert('Error al descargar el certificado'); }
  };

  if (cargando) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl text-gray-900">Certificados</h2>
        <p className="m-0 text-sm text-gray-500">{datos.length} emitidos</p>
      </div>

      <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Buscar</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[200px]"
            placeholder="Voluntario o actividad..."
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
        <Boton variante="secundario" onClick={limpiarFiltros}>Limpiar</Boton>
      </div>

      {datosFiltrados.length === 0 ? (
        <p className="text-gray-400">No se encontraron certificados.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Serie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Voluntario</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actividad</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Horas</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Emisión</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 w-24">Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.numeroSerie}</td>
                  <td className="px-4 py-3 text-gray-900">{c.nombreVoluntario}</td>
                  <td className="px-4 py-3 text-gray-600">{c.nombreActividad}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{c.horasTotales}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{new Date(c.fechaEmision).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center"><BadgeEstado estado={c.estado} mapa={ESTADOS_CERTIFICADO} /></td>
                  <td className="px-4 py-3 text-center">
                    <Boton variante="secundario" onClick={() => descargarCertificado(c.id)}>Descargar</Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CertificadosAdmin;
