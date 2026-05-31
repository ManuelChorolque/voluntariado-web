import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contextos/AuthContext';
import { actividadesApi, horasApi, certificadosApi, voluntariosApi } from '../../servicios/api';
import TarjetaInformacion from '../../componentes/reutilizables/TarjetaInformacion';
import TarjetaActividad from '../../componentes/reutilizables/TarjetaActividad';
import Boton from '../../componentes/reutilizables/Boton';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';

function DashboardOrganizacion() {
  const { usuario } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [formActividad, setFormActividad] = useState(false);
  const [formEditarAct, setFormEditarAct] = useState(false);
  const [formHoras, setFormHoras] = useState(false);
  const [formCertificado, setFormCertificado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [nuevaActividad, setNuevaActividad] = useState({ nombre: '', descripcion: '', ubicacion: '', fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1, horasPorDia: '', duracionDias: '' });
  const [editandoAct, setEditandoAct] = useState(null);
  const [editActForm, setEditActForm] = useState({ nombre: '', descripcion: '', ubicacion: '', fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1, horasPorDia: '', duracionDias: '' });
  const [nuevasHoras, setNuevasHoras] = useState({ voluntarioId: '', actividadId: '', fechaInicio: '', fechaFin: '', descripcion: '' });
  const [nuevoCertificado, setNuevoCertificado] = useState({ voluntarioId: '', actividadId: '', temaEspecifico: '', firmanteNombre: '', firmanteCargo: '' });

  const cargarDatos = useCallback(async () => {
    try {
      const [resAct, resVol] = await Promise.all([
        actividadesApi.obtenerTodos(),
        voluntariosApi.obtenerTodos()
      ]);
      setActividades(resAct.data);
      setVoluntarios(resVol.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const crearActividad = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await actividadesApi.crear({
        ...nuevaActividad,
        organizacionId: usuario.organizacionId,
        fechaInicio: new Date(nuevaActividad.fechaInicio).toISOString(),
        fechaFin: new Date(nuevaActividad.fechaFin).toISOString(),
        horasPorDia: Number(nuevaActividad.horasPorDia),
        duracionDias: Number(nuevaActividad.duracionDias)
      });
      setFormActividad(false);
      setNuevaActividad({ nombre: '', descripcion: '', ubicacion: '', fechaInicio: '', fechaFin: '', voluntariosRequeridos: 1, horasPorDia: '', duracionDias: '' });
      cargarDatos();
    } catch { alert('Error al crear actividad'); } finally { setEnviando(false); }
  };

  const abrirActividad = async (actividad) => {
    try {
      await actividadesApi.abrir(actividad.id);
      cargarDatos();
    } catch {
      alert('Error al abrir la actividad');
    }
  };

  const iniciarActividad = async (actividad) => {
    if (!confirm(`¿Iniciar la actividad "${actividad.nombre}"? Los voluntarios ya no podrán postularse.`)) return;
    try {
      await actividadesApi.iniciar(actividad.id);
      cargarDatos();
    } catch {
      alert('Error al iniciar la actividad');
    }
  };

  const completarActividad = async (actividad) => {
    if (!confirm(`¿Completar la actividad "${actividad.nombre}"?\nSe generarán certificados para todos los voluntarios.`)) return;
    try {
      await actividadesApi.completar(actividad.id);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al completar la actividad';
      alert(msg);
    }
  };

  const abrirEditar = (actividad) => {
    setEditandoAct(actividad);
    setEditActForm({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      ubicacion: actividad.ubicacion,
      fechaInicio: actividad.fechaInicio?.split('T')[0] || '',
      fechaFin: actividad.fechaFin?.split('T')[0] || '',
      voluntariosRequeridos: actividad.voluntariosRequeridos,
      horasPorDia: actividad.horasPorDia || '',
      duracionDias: actividad.duracionDias || ''
    });
    setFormEditarAct(true);
  };

  const guardarEditar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await actividadesApi.actualizar(editandoAct.id, {
        ...editActForm,
        fechaInicio: new Date(editActForm.fechaInicio).toISOString(),
        fechaFin: new Date(editActForm.fechaFin).toISOString()
      });
      setFormEditarAct(false);
      setEditandoAct(null);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.title || 'Error al actualizar actividad';
      alert(msg);
    } finally { setEnviando(false); }
  };

  const registrarHoras = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await horasApi.registrar({
        voluntarioId: Number(nuevasHoras.voluntarioId),
        actividadId: Number(nuevasHoras.actividadId),
        fechaInicio: new Date(nuevasHoras.fechaInicio).toISOString(),
        fechaFin: new Date(nuevasHoras.fechaFin).toISOString(),
        descripcion: nuevasHoras.descripcion
      });
      setFormHoras(false);
      setNuevasHoras({ voluntarioId: '', actividadId: '', fechaInicio: '', fechaFin: '', descripcion: '' });
    } catch { alert('Error al registrar horas'); } finally { setEnviando(false); }
  };

  const generarCertificado = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await certificadosApi.generar({
        voluntarioId: Number(nuevoCertificado.voluntarioId),
        actividadId: nuevoCertificado.actividadId ? Number(nuevoCertificado.actividadId) : null,
        organizacionId: usuario.organizacionId,
        temaEspecifico: nuevoCertificado.temaEspecifico,
        firmanteNombre: nuevoCertificado.firmanteNombre,
        firmanteCargo: nuevoCertificado.firmanteCargo
      });
      setFormCertificado(false);
      setNuevoCertificado({ voluntarioId: '', actividadId: '', temaEspecifico: '', firmanteNombre: '', firmanteCargo: '' });
    } catch { alert('Error al generar certificado'); } finally { setEnviando(false); }
  };

  return (
    <div>
      <h2 className="m-0 mb-1 text-lg">Panel de gestión, {usuario.nombre}</h2>
      <p className="m-0 mb-6 text-gray-500 text-sm">Administrá tus voluntarios, actividades y certificados</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        <TarjetaInformacion titulo="Voluntarios" campos={[{ etiqueta: 'Registrados', valor: cargando ? '...' : voluntarios.length }]} color="#3b82f6" />
        <TarjetaInformacion titulo="Actividades" campos={[{ etiqueta: 'Totales', valor: cargando ? '...' : actividades.length }]} color="#22c55e" />
      </div>

      <section className="mb-6">
        <h3 className="m-0 mb-4 text-lg text-gray-900">Acciones rápidas</h3>
        <div className="flex gap-3 flex-wrap">
          <Boton onClick={() => setFormActividad(true)}>Crear Actividad</Boton>
          <Boton variante="secundario" onClick={() => setFormHoras(true)}>Registrar Horas</Boton>
          <Boton variante="secundario" onClick={() => setFormCertificado(true)}>Generar Certificado</Boton>
        </div>
      </section>

      <section>
        <h3 className="m-0 mb-4 text-lg text-gray-900">Actividades recientes</h3>
        {cargando ? <p className="text-gray-500">Cargando...</p> : actividades.length === 0 ? (
          <p className="text-gray-400">No hay actividades registradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actividades.slice(0, 6).map((act) => (
              <TarjetaActividad key={act.id} actividad={act} modo="ong" onAbrir={abrirActividad} onIniciar={iniciarActividad} onCompletar={completarActividad} onEditar={abrirEditar} />
            ))}
          </div>
        )}
      </section>

      {/* Modal Crear Actividad */}
      <ModalForm abierto={formActividad} titulo="Crear Actividad" onCerrar={() => setFormActividad(false)} onSubmit={crearActividad} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={nuevaActividad.nombre} onChange={(e) => setNuevaActividad({ ...nuevaActividad, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={nuevaActividad.descripcion} onChange={(e) => setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Ubicación</label>
          <input className={estiloInput} value={nuevaActividad.ubicacion} onChange={(e) => setNuevaActividad({ ...nuevaActividad, ubicacion: e.target.value })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Fecha inicio</label>
            <input type="date" className={estiloInput} value={nuevaActividad.fechaInicio} onChange={(e) => setNuevaActividad({ ...nuevaActividad, fechaInicio: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Fecha fin</label>
            <input type="date" className={estiloInput} value={nuevaActividad.fechaFin} onChange={(e) => setNuevaActividad({ ...nuevaActividad, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" className={estiloInput} value={nuevaActividad.voluntariosRequeridos} onChange={(e) => setNuevaActividad({ ...nuevaActividad, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Horas por día</label>
            <input type="number" min="0.5" step="0.5" className={estiloInput} value={nuevaActividad.horasPorDia} onChange={(e) => setNuevaActividad({ ...nuevaActividad, horasPorDia: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Duración (días)</label>
            <input type="number" min="1" className={estiloInput} value={nuevaActividad.duracionDias} onChange={(e) => setNuevaActividad({ ...nuevaActividad, duracionDias: e.target.value })} required />
          </div>
        </div>
      </ModalForm>

      {/* Modal Editar Actividad */}
      <ModalForm abierto={formEditarAct} titulo="Editar Actividad" onCerrar={() => setFormEditarAct(false)} onSubmit={guardarEditar} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={editActForm.nombre} onChange={(e) => setEditActForm({ ...editActForm, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={editActForm.descripcion} onChange={(e) => setEditActForm({ ...editActForm, descripcion: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Ubicación</label>
          <input className={estiloInput} value={editActForm.ubicacion} onChange={(e) => setEditActForm({ ...editActForm, ubicacion: e.target.value })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Fecha inicio</label>
            <input type="date" className={estiloInput} value={editActForm.fechaInicio} onChange={(e) => setEditActForm({ ...editActForm, fechaInicio: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Fecha fin</label>
            <input type="date" className={estiloInput} value={editActForm.fechaFin} onChange={(e) => setEditActForm({ ...editActForm, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntarios requeridos</label>
          <input type="number" min="1" className={estiloInput} value={editActForm.voluntariosRequeridos} onChange={(e) => setEditActForm({ ...editActForm, voluntariosRequeridos: Number(e.target.value) })} required />
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Horas por día</label>
            <input type="number" min="0.5" step="0.5" className={estiloInput} value={editActForm.horasPorDia} onChange={(e) => setEditActForm({ ...editActForm, horasPorDia: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Duración (días)</label>
            <input type="number" min="1" className={estiloInput} value={editActForm.duracionDias} onChange={(e) => setEditActForm({ ...editActForm, duracionDias: e.target.value })} required />
          </div>
        </div>
      </ModalForm>

      {/* Modal Registrar Horas */}
      <ModalForm abierto={formHoras} titulo="Registrar Horas" onCerrar={() => setFormHoras(false)} onSubmit={registrarHoras} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntario</label>
          <select className={estiloInput} value={nuevasHoras.voluntarioId} onChange={(e) => setNuevasHoras({ ...nuevasHoras, voluntarioId: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {voluntarios.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre} {v.apellido}</option>
            ))}
          </select>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Actividad</label>
          <select className={estiloInput} value={nuevasHoras.actividadId} onChange={(e) => setNuevasHoras({ ...nuevasHoras, actividadId: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className={estiloLabel}>Fecha/Hora inicio</label>
            <input type="datetime-local" className={estiloInput} value={nuevasHoras.fechaInicio} onChange={(e) => setNuevasHoras({ ...nuevasHoras, fechaInicio: e.target.value })} required />
          </div>
          <div className="flex-1">
            <label className={estiloLabel}>Fecha/Hora fin</label>
            <input type="datetime-local" className={estiloInput} value={nuevasHoras.fechaFin} onChange={(e) => setNuevasHoras({ ...nuevasHoras, fechaFin: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[60px]`} value={nuevasHoras.descripcion} onChange={(e) => setNuevasHoras({ ...nuevasHoras, descripcion: e.target.value })} />
        </div>
      </ModalForm>

      {/* Modal Generar Certificado */}
      <ModalForm abierto={formCertificado} titulo="Generar Certificado" onCerrar={() => setFormCertificado(false)} onSubmit={generarCertificado} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Voluntario</label>
          <select className={estiloInput} value={nuevoCertificado.voluntarioId} onChange={(e) => setNuevoCertificado({ ...nuevoCertificado, voluntarioId: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {voluntarios.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre} {v.apellido}</option>
            ))}
          </select>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Actividad (opcional)</label>
          <select className={estiloInput} value={nuevoCertificado.actividadId} onChange={(e) => setNuevoCertificado({ ...nuevoCertificado, actividadId: e.target.value })}>
            <option value="">Seleccionar...</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Tema específico</label>
          <input className={estiloInput} value={nuevoCertificado.temaEspecifico} onChange={(e) => setNuevoCertificado({ ...nuevoCertificado, temaEspecifico: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Firmante (nombre)</label>
          <input className={estiloInput} value={nuevoCertificado.firmanteNombre} onChange={(e) => setNuevoCertificado({ ...nuevoCertificado, firmanteNombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Firmante (cargo)</label>
          <input className={estiloInput} value={nuevoCertificado.firmanteCargo} onChange={(e) => setNuevoCertificado({ ...nuevoCertificado, firmanteCargo: e.target.value })} required />
        </div>
      </ModalForm>
    </div>
  );
}

export default DashboardOrganizacion;
