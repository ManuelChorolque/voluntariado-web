import { useState, useEffect } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { useNavigate } from 'react-router-dom';
import { actividadesApi, horasApi, certificadosApi, voluntariosApi, organizacionesApi } from '../../servicios/api';
import TarjetaInformacion from '../../componentes/reutilizables/TarjetaInformacion';
import Boton from '../../componentes/reutilizables/Boton';

function DashboardAdmin() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ voluntarios: 0, horas: 0, certificados: 0, actividades: 0, organizaciones: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [resV, resH, resC, resA, resO] = await Promise.all([
          voluntariosApi.obtenerTodos(),
          horasApi.obtenerTodos(),
          certificadosApi.obtenerTodos(),
          actividadesApi.obtenerTodos(),
          organizacionesApi.obtenerTodos()
        ]);
        setStats({
          voluntarios: resV.data.length,
          horas: resH.data.length,
          certificados: resC.data.length,
          actividades: resA.data.length,
          organizaciones: resO.data.length
        });
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, []);

  const tarjetas = [
    { titulo: 'Organizaciones', valor: stats.organizaciones, color: '#8b5cf6', ruta: '/organizaciones', label: 'Gestionar' },
    { titulo: 'Actividades', valor: stats.actividades, color: '#22c55e', ruta: '/actividades', label: 'Ver todas' },
    { titulo: 'Voluntarios', valor: stats.voluntarios, color: '#3b82f6', ruta: '/voluntarios', label: 'Ver todos' },
    { titulo: 'Horas', valor: stats.horas, color: '#f59e0b', ruta: '/horas', label: 'Ver registros' },
    { titulo: 'Certificados', valor: stats.certificados, color: '#ef4444', ruta: '/certificados', label: 'Ver emitidos' }
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>Panel de administración</h2>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>
        Control total del sistema, {usuario.nombre}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {tarjetas.map((t) => (
          <div key={t.titulo} style={{ cursor: 'pointer' }} onClick={() => navigate(t.ruta)}>
            <TarjetaInformacion
              titulo={t.titulo}
              campos={[{ etiqueta: t.label, valor: cargando ? '...' : t.valor }]}
              color={t.color}
            />
          </div>
        ))}
      </div>

      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111827' }}>Acciones rápidas</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Boton onClick={() => navigate('/organizaciones')}>Gestionar Organizaciones</Boton>
          <Boton variante="secundario" onClick={() => navigate('/actividades')}>Ver Actividades</Boton>
          <Boton variante="secundario" onClick={() => navigate('/voluntarios')}>Ver Voluntarios</Boton>
          <Boton variante="secundario" onClick={() => navigate('/certificados')}>Ver Certificados</Boton>
        </div>
      </section>
    </div>
  );
}

export default DashboardAdmin;
