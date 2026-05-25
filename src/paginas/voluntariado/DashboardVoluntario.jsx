import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi, horasApi, certificadosApi } from '../../servicios/api';
import TarjetaInformacion from '../../componentes/reutilizables/TarjetaInformacion';
import TarjetaActividad from '../../componentes/reutilizables/TarjetaActividad';
import BadgeEstado from '../../componentes/reutilizables/BadgeEstado';
import Boton from '../../componentes/reutilizables/Boton';
import { ESTADOS_CERTIFICADO } from '../../constantes';

function DashboardVoluntario() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [totalHoras, setTotalHoras] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const [resAct, resCerts, resHoras] = await Promise.all([
        actividadesApi.obtenerAbiertas(),
        usuario.voluntarioId ? certificadosApi.obtenerPorVoluntario(usuario.voluntarioId) : Promise.resolve({ data: [] }),
        usuario.voluntarioId ? horasApi.obtenerTotalPorVoluntario(usuario.voluntarioId) : Promise.resolve({ data: null })
      ]);
      setActividades(resAct.data);
      setCertificados(resCerts.data);
      setTotalHoras(resHoras.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, [usuario.voluntarioId]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

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
    } catch { alert('Error al descargar'); }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>Bienvenido, {usuario.nombre}</h2>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>Tu perfil de impacto social</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <TarjetaInformacion titulo="Total Horas" campos={[{ etiqueta: 'Acumuladas', valor: totalHoras !== null ? `${totalHoras}h` : '—' }]} color="#3b82f6" />
        <TarjetaInformacion titulo="Actividades" campos={[{ etiqueta: 'Abiertas', valor: actividades.length }]} color="#22c55e" />
        <TarjetaInformacion titulo="Certificados" campos={[{ etiqueta: 'Obtenidos', valor: Array.isArray(certificados) ? certificados.length : '—' }]} color="#8b5cf6" />
      </div>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111827' }}>Oportunidades de Voluntariado</h3>
        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        ) : actividades.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No hay actividades abiertas en este momento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {actividades.map((act) => (
              <TarjetaActividad key={act.id} actividad={act} modo="voluntario" onActualizar={cargarDatos} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111827' }}>Mis Certificados</h3>
        {!Array.isArray(certificados) || certificados.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>Aún no tenés certificados.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {certificados.map((c) => (
              <div key={c.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.numeroSerie}</span>
                  <BadgeEstado estado={c.estado} mapa={ESTADOS_CERTIFICADO} />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600 }}>{c.nombreOrganizacion}</p>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                  {c.horasTotales}h · {new Date(c.fechaEmision).toLocaleDateString()}
                </p>
                <Boton variante="secundario" onClick={() => descargar(c.id)}>Descargar PDF</Boton>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardVoluntario;
