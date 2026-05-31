import { useState, useEffect } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { useNavigate } from 'react-router-dom';
import { actividadesApi, certificadosApi, voluntariosApi, organizacionesApi } from '../../servicios/api';
import TarjetaInformacion from '../../componentes/reutilizables/TarjetaInformacion';
import Boton from '../../componentes/reutilizables/Boton';

function DashboardAdmin() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ voluntarios: 0, certificados: 0, actividades: 0, organizaciones: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [resV, resC, resA, resO] = await Promise.all([
          voluntariosApi.obtenerTodos(),
          certificadosApi.obtenerTodos(),
          actividadesApi.obtenerTodos({ pageSize: 1 }),
          organizacionesApi.obtenerTodos()
        ]);
        const totalAct = resA.data.total ?? resA.data.length ?? 0;
        setStats({
          voluntarios: resV.data.length,
          certificados: resC.data.length,
          actividades: totalAct,
          organizaciones: resO.data.length
        });
      } catch { /* silent */ } finally { setCargando(false); }
    })();
  }, []);

  const tarjetas = [
    { titulo: 'Organizaciones', valor: stats.organizaciones, color: '#8b5cf6', ruta: '/usuarios', icono: '🏢' },
    { titulo: 'Voluntarios', valor: stats.voluntarios, color: '#3b82f6', ruta: '/usuarios', icono: '👥' },
    { titulo: 'Actividades', valor: stats.actividades, color: '#22c55e', ruta: '/actividades', icono: '📋' },
    { titulo: 'Certificados', valor: stats.certificados, color: '#ef4444', ruta: '/certificados', icono: '📜' }
  ];

  return (
    <div>
      <h2 className="m-0 mb-1 text-lg">Panel de administración</h2>
      <p className="m-0 mb-6 text-gray-500 text-sm">
        Control general del sistema, {usuario.nombre}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map((t) => (
          <div key={t.titulo} className="cursor-pointer" onClick={() => navigate(t.ruta)}>
            <TarjetaInformacion
              titulo={t.titulo}
              campos={[{ etiqueta: 'Total', valor: cargando ? '...' : t.valor }]}
              color={t.color}
            />
          </div>
        ))}
      </div>

      <section>
        <h3 className="m-0 mb-4 text-lg text-gray-900">Gestión del sistema</h3>
        <div className="flex gap-3 flex-wrap">
          <Boton onClick={() => navigate('/usuarios')}>Gestionar Usuarios</Boton>
          <Boton variante="secundario" onClick={() => navigate('/actividades')}>Ver Actividades</Boton>
          <Boton variante="secundario" onClick={() => navigate('/certificados')}>Ver Certificados</Boton>
        </div>
      </section>
    </div>
  );
}

export default DashboardAdmin;
