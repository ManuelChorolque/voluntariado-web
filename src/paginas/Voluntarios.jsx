import { useState, useEffect } from 'react';
import { voluntariosApi } from '../servicios/api';
import TablaGenerica from '../componentes/reutilizables/TablaGenerica';
import Buscador from '../componentes/reutilizables/Buscador';
import ModalConfirmacion from '../componentes/reutilizables/ModalConfirmacion';
import Boton from '../componentes/reutilizables/Boton';
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
          style={{
            background: config.color + '20',
            color: config.color,
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}
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

  const calcularTotalHoras = () => {
    const total = datos.reduce((acc, v) => acc + Number(v.horasTotales), 0);
    alert(`Total de horas registradas: ${total}`);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <h2 style={{ margin: 0 }}>Voluntarios</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar voluntario..." />
          <Boton variante="secundario" onClick={calcularTotalHoras}>
            Total Horas
          </Boton>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
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
