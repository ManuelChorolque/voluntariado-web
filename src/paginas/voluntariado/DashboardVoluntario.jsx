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
      <h2 className="m-0 mb-1 text-lg">Bienvenido, {usuario.nombre}</h2>
      <p className="m-0 mb-6 text-gray-500 text-sm">Tu perfil de impacto social</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        <TarjetaInformacion titulo="Total Horas" campos={[{ etiqueta: 'Acumuladas', valor: totalHoras !== null ? `${totalHoras}h` : '—' }]} color="#3b82f6" />
        <TarjetaInformacion titulo="Actividades" campos={[{ etiqueta: 'Abiertas', valor: actividades.length }]} color="#22c55e" />
        <TarjetaInformacion titulo="Certificados" campos={[{ etiqueta: 'Obtenidos', valor: Array.isArray(certificados) ? certificados.length : '—' }]} color="#8b5cf6" />
      </div>

      <section className="mb-8">
        <h3 className="m-0 mb-4 text-lg text-gray-900">Oportunidades de Voluntariado</h3>
        {cargando ? (
          <p className="text-gray-500">Cargando...</p>
        ) : actividades.length === 0 ? (
          <p className="text-gray-400">No hay actividades abiertas en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actividades.map((act) => (
              <TarjetaActividad key={act.id} actividad={act} modo="voluntario" onActualizar={cargarDatos} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="m-0 mb-4 text-lg text-gray-900">Mis Certificados</h3>
        {!Array.isArray(certificados) || certificados.length === 0 ? (
          <p className="text-gray-400">Aún no tenés certificados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {certificados.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">{c.numeroSerie}</span>
                  <BadgeEstado estado={c.estado} mapa={ESTADOS_CERTIFICADO} />
                </div>
                <p className="m-0 mb-1 text-sm font-semibold">{c.nombreOrganizacion}</p>
                <p className="m-0 mb-3 text-sm text-gray-500">
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
