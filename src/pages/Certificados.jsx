import { useState, useEffect } from 'react';
import { certificadosApi } from '../services/api';
import TablaGenerica from '../components/comunes/TablaGenerica';
import ModalConfirmacion from '../components/comunes/ModalConfirmacion';
import Boton from '../components/comunes/Boton';
import { ESTADOS_CERTIFICADO, MENSAJES } from '../constants';

const COLUMNAS = [
  { clave: 'numeroSerie', etiqueta: 'Serie' },
  { clave: 'nombreVoluntario', etiqueta: 'Voluntario' },
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
  }
];

function Certificados() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const cargarDatos = async () => {
    try {
      const respuesta = await certificadosApi.obtenerTodos();
      setDatos(respuesta.data);
    } catch {
      alert(MENSAJES.ERROR_CARGA);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirModalEliminar = (id) => {
    setIdSeleccionado(id);
    setModalAbierto(true);
  };

  const confirmarEliminar = async () => {
    setConfirmando(true);
    try {
      await certificadosApi.eliminar(idSeleccionado);
      setModalAbierto(false);
      setIdSeleccionado(null);
      cargarDatos();
    } catch {
      alert('Error al eliminar');
    } finally {
      setConfirmando(false);
    }
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
    } catch {
      alert('Error al descargar el certificado');
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
        <h2 style={{ margin: 0 }}>Certificados</h2>
      </div>

      <TablaGenerica
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        alHacerClickEnEliminar={abrirModalEliminar}
        acciones={(fila) => (
          <Boton variante="secundario" onClick={() => descargarCertificado(fila.id)}>
            Descargar
          </Boton>
        )}
      />

      <div style={{ marginTop: '12px' }}>
        <Boton onClick={cargarDatos} variante="secundario">Refrescar</Boton>
      </div>

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Eliminar certificado"
        mensaje={MENSAJES.CONFIRMAR_ELIMINAR}
        onConfirmar={confirmarEliminar}
        onCancelar={() => { setModalAbierto(false); setIdSeleccionado(null); }}
        confirmando={confirmando}
      />
    </div>
  );
}

export default Certificados;
