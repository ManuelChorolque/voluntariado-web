import { useState, useEffect } from 'react';
import { useAuth } from '../contextos/AuthContext';
import { certificadosApi } from '../servicios/api';
import TablaGenerica from '../componentes/reutilizables/TablaGenerica';
import Boton from '../componentes/reutilizables/Boton';
import { ESTADOS_CERTIFICADO } from '../constantes';

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
        <span style={{ background: config.color + '20', color: config.color, padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
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

  useEffect(() => {
    if (!usuario?.voluntarioId) { setCargando(false); return; }
    (async () => {
      try {
        const res = await certificadosApi.obtenerPorVoluntario(usuario.voluntarioId);
        setDatos(res.data);
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, [usuario?.voluntarioId]);

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
      <h2 style={{ margin: '0 0 20px' }}>Mis Certificados</h2>
      <TablaGenerica
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        acciones={(fila) => (
          <Boton variante="secundario" onClick={() => descargar(fila.id)}>Descargar</Boton>
        )}
      />
    </div>
  );
}

export default MisCertificados;
