import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { certificadosApi } from '../../servicios/api';
import TablaGenerica from '../../componentes/reutilizables/TablaGenerica';
import ModalConfirmacion from '../../componentes/reutilizables/ModalConfirmacion';
import Boton from '../../componentes/reutilizables/Boton';
import { ESTADOS_CERTIFICADO } from '../../constantes';

const COLUMNAS = [
  { clave: 'numeroSerie', etiqueta: 'Serie' },
  { clave: 'nombreVoluntario', etiqueta: 'Voluntario' },
  { clave: 'nombreActividad', etiqueta: 'Actividad' },
  { clave: 'horas', etiqueta: 'Horas' },
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
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: config.color + '20', color: config.color }}
        >
          {config.label}
        </span>
      );
    }
  },
  {
    clave: 'activo',
    etiqueta: 'Activo',
    renderizar: (valor) => {
      const color = valor ? '#22c55e' : '#ef4444';
      const label = valor ? 'Activado' : 'Desactivado';
      return (
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: color + '20', color }}
        >
          {label}
        </span>
      );
    }
  }
];

function CertificadosOrganizacion() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [certSeleccionado, setCertSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const cargarDatos = async () => {
    try {
      const respuesta = await certificadosApi.obtenerActividadesPorOrganizacion(usuario.organizacionId);
      setDatos(respuesta.data);
    } catch {
      alert('Error al cargar los datos');
    }
  };

  const datosFiltrados = useMemo(() => {
    return datos.filter((c) => {
      if (busqueda && !c.nombreVoluntario?.toLowerCase().includes(busqueda.toLowerCase()))
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

  useEffect(() => { (async () => { await cargarDatos(); setCargando(false); })(); }, []);

  const recargarDatos = async () => {
    setCargando(true);
    await cargarDatos();
    setCargando(false);
  };

  const abrirModalToggle = (cert) => {
    setCertSeleccionado(cert);
    setModalAbierto(true);
  };

  const confirmarToggle = async () => {
    if (!certSeleccionado) return;
    setConfirmando(true);
    try {
      await certificadosApi.toggleActivoActividad(certSeleccionado.id);
      setModalAbierto(false);
      setCertSeleccionado(null);
      recargarDatos();
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setConfirmando(false);
    }
  };

  const descargarCertificado = async (certificadoId) => {
    try {
      const respuesta = await certificadosApi.descargar(certificadoId);
      const url = window.URL.createObjectURL(new Blob([respuesta.data]));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.setAttribute('download', `certificado-${certificadoId}.pdf`);
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar el certificado');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0">Certificados</h2>
      </div>

      <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Buscar por voluntario</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[180px]"
            placeholder="Nombre del voluntario..."
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

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datosFiltrados}
        cargando={cargando}
        acciones={(fila) => (
          <div className="flex gap-1.5">
            <Boton variante="secundario" onClick={() => descargarCertificado(fila.certificadoId)}>
              Descargar
            </Boton>
            <Boton
              variante={fila.activo ? 'peligro' : 'primario'}
              onClick={() => abrirModalToggle(fila)}
            >
              {fila.activo ? 'Desactivar' : 'Activar'}
            </Boton>
          </div>
        )}
      />

      <div className="mt-3">
        <Boton onClick={recargarDatos} variante="secundario">Refrescar</Boton>
      </div>

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo={certSeleccionado?.activo ? 'Desactivar actividad' : 'Activar actividad'}
        mensaje={
          certSeleccionado?.activo
            ? `¿Desactivar ${certSeleccionado?.nombreActividad} para ${certSeleccionado?.nombreVoluntario}? No aparecerá en la descarga del certificado.`
            : `¿Activar ${certSeleccionado?.nombreActividad} para ${certSeleccionado?.nombreVoluntario}? Volverá a aparecer en la descarga del certificado.`
        }
        textoConfirmar={certSeleccionado?.activo ? 'Desactivar' : 'Activar'}
        textoProcesando={certSeleccionado?.activo ? 'Desactivando...' : 'Activando...'}
        onConfirmar={confirmarToggle}
        onCancelar={() => { setModalAbierto(false); setCertSeleccionado(null); }}
        confirmando={confirmando}
      />
    </div>
  );
}

export default CertificadosOrganizacion;
