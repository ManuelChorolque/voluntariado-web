import { useState, useEffect } from 'react';
import { voluntariosApi } from '../../servicios/api';
import { useAuth } from '../../contextos/AuthContext';
import TablaGenerica from '../../componentes/reutilizables/TablaGenerica';
import Buscador from '../../componentes/reutilizables/Buscador';
import ModalConfirmacion from '../../componentes/reutilizables/ModalConfirmacion';
import TarjetaInformacion from '../../componentes/reutilizables/TarjetaInformacion';
import { ESTADOS_VOLUNTARIO, MENSAJES } from '../../constantes';

const COLUMNAS = [
  { clave: 'nombre', etiqueta: 'Nombre' },
  { clave: 'apellido', etiqueta: 'Apellido' },
  { clave: 'email', etiqueta: 'Email' },
  { clave: 'telefono', etiqueta: 'Teléfono' },
  {
    clave: 'estado',
    etiqueta: 'Estado',
    renderizar: (valor) => {
      const config = ESTADOS_VOLUNTARIO[valor] ?? { label: valor, color: '#6b7280' };
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
  { clave: 'horasTotales', etiqueta: 'Horas' },
  { clave: 'nombreOrganizacion', etiqueta: 'Organización' }
];

function Voluntarios() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Admin';
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const respuesta = await voluntariosApi.obtenerTodos();
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
      const respuesta = await voluntariosApi.obtenerTodos();
      setDatos(respuesta.data);
    } catch {
      alert(MENSAJES.ERROR_CARGA);
    }
  };

  const datosFiltrados = busqueda
    ? datos.filter((v) =>
        `${v.nombre} ${v.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
      )
    : datos;

  const abrirModal = (vol) => {
    setVoluntarioSeleccionado(vol);
    setModalAbierto(true);
  };

  const confirmarAccion = async () => {
    if (!voluntarioSeleccionado) return;
    setConfirmando(true);
    try {
      if (esAdmin) {
        const esActivo = voluntarioSeleccionado.estado === 'Activo';
        if (esActivo) {
          await voluntariosApi.eliminar(voluntarioSeleccionado.id);
        } else {
          await voluntariosApi.reactivar(voluntarioSeleccionado.id);
        }
      } else {
        await voluntariosApi.desvincular(voluntarioSeleccionado.id);
      }
      setModalAbierto(false);
      setVoluntarioSeleccionado(null);
      recargarDatos();
    } catch {
      alert('Error al realizar la operación');
    } finally {
      setConfirmando(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVoluntarioSeleccionado(null);
  };

  const getEtiqueta = (fila) => {
    if (!esAdmin) return 'Desvincular';
    return fila.estado === 'Activo' ? 'Desactivar' : 'Activar';
  };

  const getColor = (fila) => {
    if (!esAdmin) return '#ef4444';
    return fila.estado === 'Activo' ? '#ef4444' : '#16a34a';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="m-0">Voluntarios</h2>
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar voluntario..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <TarjetaInformacion
          titulo="Total Voluntarios"
          campos={[{ etiqueta: 'Cantidad', valor: datos.length }]}
          color="#3b82f6"
        />
        <TarjetaInformacion
          titulo="Horas Totales"
          campos={[{ etiqueta: 'Suma', valor: datos.reduce((a, v) => a + Number(v.horasTotales), 0).toFixed(1) }]}
          color="#22c55e"
        />
      </div>

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datosFiltrados}
        cargando={cargando}
        acciones={(fila) => (
          <button
            onClick={() => abrirModal(fila)}
            className="bg-none border-none cursor-pointer text-sm hover:text-opacity-80"
            style={{ color: getColor(fila) }}
          >
            {getEtiqueta(fila)}
          </button>
        )}
      />

      {voluntarioSeleccionado && (
        <ModalConfirmacion
          abierto={modalAbierto}
          titulo={esAdmin
            ? (voluntarioSeleccionado.estado === 'Activo' ? 'Desactivar voluntario' : 'Reactivar voluntario')
            : 'Desvincular voluntario'}
          mensaje={esAdmin
            ? (voluntarioSeleccionado.estado === 'Activo'
                ? '¿Desactivar este voluntario? El voluntario dejará de poder operar pero se conservará su historial.'
                : '¿Reactivar este voluntario? Volverá a estar operativo.')
            : '¿Desvincular este voluntario? El voluntario dejará de estar asociado a tu organización.'}
          onConfirmar={confirmarAccion}
          onCancelar={cerrarModal}
          confirmando={confirmando}
          textoConfirmar={esAdmin
            ? (voluntarioSeleccionado.estado === 'Activo' ? 'Desactivar' : 'Activar')
            : 'Desvincular'}
          textoProcesando={esAdmin
            ? (voluntarioSeleccionado.estado === 'Activo' ? 'Desactivando...' : 'Activando...')
            : 'Desvinculando...'}
        />
      )}
    </div>
  );
}

export default Voluntarios;
