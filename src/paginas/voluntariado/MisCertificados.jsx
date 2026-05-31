import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { certificadosApi } from '../../servicios/api';
import TablaGenerica from '../../componentes/reutilizables/TablaGenerica';
import Boton from '../../componentes/reutilizables/Boton';
import { ESTADOS_CERTIFICADO } from '../../constantes';

const COLUMNAS = [
  { clave: 'numeroSerie', etiqueta: 'Serie' },
  { clave: 'nombreOrganizacion', etiqueta: 'Organización' },
  { clave: 'horasTotales', etiqueta: 'Horas' },
  {
    clave: 'fechaEmision',
    etiqueta: 'Emisión',
    renderizar: (valor) => new Date(valor).toLocaleDateString()
  },
  {
    clave: 'estado',
    etiqueta: 'Estado',
    renderizar: (valor) => {
      const config = ESTADOS_CERTIFICADO[valor] ?? { label: valor, color: '#6b7280' };
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: config.color + '20', color: config.color }}>
          {config.label}
        </span>
      );
    }
  }
];

function MisCertificados() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    if (!usuario?.voluntarioId) { setCargando(false); return; }
    (async () => {
      try {
        const res = await certificadosApi.obtenerPorVoluntario(usuario.voluntarioId);
        setDatos(res.data);
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, [usuario?.voluntarioId]);

  const datosFiltrados = useMemo(() => {
    return datos.filter((c) => {
      if (busqueda && !c.nombreOrganizacion?.toLowerCase().includes(busqueda.toLowerCase()))
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

  const descargar = async (id) => {
    try {
      const res = await certificadosApi.descargar(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.setAttribute('download', `certificado-${id}.pdf`);
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar');
    }
  };

  return (
    <div>
      <h2 className="m-0 mb-1 text-lg">Mis Certificados</h2>
      <p className="m-0 mb-5 text-gray-500 text-sm">
        Certificados obtenidos por tu participación
      </p>

      <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Buscar por organización</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[200px]"
            placeholder="Nombre de la organización..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Desde</label>
          <input type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Hasta</label>
          <input type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <Boton variante="secundario" onClick={limpiarFiltros}>Limpiar</Boton>
      </div>

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datosFiltrados}
        cargando={cargando}
        acciones={(fila) => (
          <Boton variante="secundario" onClick={() => descargar(fila.id)}>Descargar</Boton>
        )}
      />
    </div>
  );
}

export default MisCertificados;
