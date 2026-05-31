import { useState, useEffect, useMemo } from 'react';
import { horasApi } from '../../servicios/api';
import TablaGenerica from '../../componentes/reutilizables/TablaGenerica';
import ModalConfirmacion from '../../componentes/reutilizables/ModalConfirmacion';
import Boton from '../../componentes/reutilizables/Boton';
import { MENSAJES } from '../../constantes';

const COLUMNAS = [
  { clave: 'nombreVoluntario', etiqueta: 'Voluntario' },
  { clave: 'nombreActividad', etiqueta: 'Actividad' },
  { clave: 'horas', etiqueta: 'Horas' },
  {
    clave: 'fechaActividad',
    etiqueta: 'Fecha',
    renderizar: (valor) => new Date(valor).toLocaleDateString()
  },
  { clave: 'descripcion', etiqueta: 'Descripción' }
];

function Horas() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const respuesta = await horasApi.obtenerTodos();
        setDatos(respuesta.data);
      } catch {
        alert(MENSAJES.ERROR_CARGA);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const recargarDatos = async () => {
    try {
      const respuesta = await horasApi.obtenerTodos();
      setDatos(respuesta.data);
    } catch {
      alert(MENSAJES.ERROR_CARGA);
    }
  };

  const datosFiltrados = useMemo(() => {
    if (!busqueda) return datos;
    return datos.filter((h) =>
      h.nombreVoluntario?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [datos, busqueda]);

  const totalFiltrado = useMemo(
    () => datosFiltrados.reduce((acc, h) => acc + Number(h.horas), 0),
    [datosFiltrados]
  );

  const limpiarFiltros = () => {
    setBusqueda('');
  };

  const abrirModalEliminar = (id) => {
    setIdSeleccionado(id);
    setModalAbierto(true);
  };

  const confirmarEliminar = async () => {
    setConfirmando(true);
    try {
      await horasApi.eliminar(idSeleccionado);
      setModalAbierto(false);
      setIdSeleccionado(null);
      recargarDatos();
    } catch {
      alert('Error al eliminar');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0">Horas de Voluntariado</h2>
        <span className="text-sm text-gray-500">
          {busqueda ? 'Filtradas' : 'Total'}: <strong>{totalFiltrado.toFixed(1)}</strong> horas
        </span>
      </div>

      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por voluntario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[220px]"
        />
        <Boton variante="secundario" onClick={limpiarFiltros}>Limpiar</Boton>
      </div>

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datosFiltrados}
        cargando={cargando}
        alHacerClickEnEliminar={abrirModalEliminar}
        textoBotonEliminar="Anular"
      />

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Anular registro de horas"
        mensaje={MENSAJES.CONFIRMAR_ELIMINAR}
        onConfirmar={confirmarEliminar}
        onCancelar={() => { setModalAbierto(false); setIdSeleccionado(null); }}
        confirmando={confirmando}
        textoConfirmar="Anular"
        textoProcesando="Anulando..."
      />
    </div>
  );
}

export default Horas;
