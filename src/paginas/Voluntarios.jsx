import { useState, useEffect } from 'react';
import { voluntariosApi } from '../servicios/api';
import TablaGenerica from '../componentes/reutilizables/TablaGenerica';
import Buscador from '../componentes/reutilizables/Buscador';
import ModalConfirmacion from '../componentes/reutilizables/ModalConfirmacion';
import TarjetaInformacion from '../componentes/reutilizables/TarjetaInformacion';
import { ESTADOS_VOLUNTARIO, MENSAJES } from '../constantes';

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
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
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

  const abrirModalEliminar = (id) => {
    setIdSeleccionado(id);
    setModalAbierto(true);
  };

  const confirmarEliminar = async () => {
    setConfirmando(true);
    try {
      await voluntariosApi.eliminar(idSeleccionado);
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
        alHacerClickEnEliminar={abrirModalEliminar}
      />

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Eliminar voluntario"
        mensaje={MENSAJES.CONFIRMAR_ELIMINAR}
        onConfirmar={confirmarEliminar}
        onCancelar={() => { setModalAbierto(false); setIdSeleccionado(null); }}
        confirmando={confirmando}
      />
    </div>
  );
}

export default Voluntarios;
