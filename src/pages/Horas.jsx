import { useState, useEffect } from 'react';
import { horasApi } from '../services/api';
import TablaGenerica from '../components/comunes/TablaGenerica';
import ModalConfirmacion from '../components/comunes/ModalConfirmacion';
import { MENSAJES } from '../constants';

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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const cargarDatos = async () => {
    try {
      const respuesta = await horasApi.obtenerTodos();
      setDatos(respuesta.data);
    } catch {
      alert(MENSAJES.ERROR_CARGA);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const totalHoras = datos.reduce((acc, h) => acc + Number(h.horas), 0);

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
      cargarDatos();
    } catch {
      alert('Error al eliminar');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h2 style={{ margin: 0 }}>Horas de Voluntariado</h2>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Total: <strong>{totalHoras.toFixed(1)}</strong> horas
        </span>
      </div>

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        alHacerClickEnEliminar={abrirModalEliminar}
      />

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Eliminar registro de horas"
        mensaje={MENSAJES.CONFIRMAR_ELIMINAR}
        onConfirmar={confirmarEliminar}
        onCancelar={() => { setModalAbierto(false); setIdSeleccionado(null); }}
        confirmando={confirmando}
      />
    </div>
  );
}

export default Horas;
