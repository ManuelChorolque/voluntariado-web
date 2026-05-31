import { useState, useEffect, useCallback } from 'react';
import { organizacionesApi, voluntariosApi, adminApi } from '../../servicios/api';
import Boton from '../../componentes/reutilizables/Boton';
import Buscador from '../../componentes/reutilizables/Buscador';
import ModalForm, { estiloInput, estiloLabel } from '../../componentes/reutilizables/ModalForm';
import ModalConfirmacion from '../../componentes/reutilizables/ModalConfirmacion';
import { ESTADOS_VOLUNTARIO, MENSAJES } from '../../constantes';

const TABS = [
  { id: 'organizaciones', label: 'Organizaciones' },
  { id: 'voluntarios', label: 'Voluntarios' },
  { id: 'cuentas', label: 'Cuentas del Sistema' }
];

function GestionUsuarios() {
  const [tabActivo, setTabActivo] = useState('organizaciones');

  return (
    <div>
      <h2 className="m-0 mb-5 text-xl text-gray-900">Gestión de Usuarios</h2>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabActivo(t.id)}
            className={`px-4 py-2 text-sm font-medium border-none bg-none cursor-pointer transition-colors ${
              tabActivo === t.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabActivo === 'organizaciones' && <OrganizacionesTab />}
      {tabActivo === 'voluntarios' && <VoluntariosTab />}
      {tabActivo === 'cuentas' && <CuentasTab />}
    </div>
  );
}

function OrganizacionesTab() {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detalleOrg, setDetalleOrg] = useState(null);
  const [editandoOrg, setEditandoOrg] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalCrearUsuario, setModalCrearUsuario] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalOrgAccion, setModalOrgAccion] = useState(false);
  const [orgAccionSeleccionada, setOrgAccionSeleccionada] = useState(null);
  const [tipoAccionOrg, setTipoAccionOrg] = useState('');
  const [confirmandoOrg, setConfirmandoOrg] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: '', descripcion: '', contacto: '', email: '', telefono: '', direccion: ''
  });
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', apellido: '', email: '', password: '', organizacionId: ''
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await organizacionesApi.obtenerTodos();
      setOrganizaciones(res.data);
    } catch { /* silent */ } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const crearOrganizacion = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await organizacionesApi.crear(formCrear);
      setModalCrear(false);
      setFormCrear({ nombre: '', descripcion: '', contacto: '', email: '', telefono: '', direccion: '' });
      cargarDatos();
    } catch { alert('Error al crear organización'); } finally { setEnviando(false); }
  };

  const abrirEditar = (org) => {
    setEditandoOrg(org);
    setFormCrear({
      nombre: org.nombre, descripcion: org.descripcion || '', contacto: org.contacto,
      email: org.email, telefono: org.telefono || '', direccion: org.direccion || ''
    });
    setModalEditar(true);
  };

  const guardarEditar = async (e) => {
    e.preventDefault();
    if (!editandoOrg) return;
    setEnviando(true);
    try {
      await organizacionesApi.actualizar(editandoOrg.id, formCrear);
      setModalEditar(false);
      setEditandoOrg(null);
      setFormCrear({ nombre: '', descripcion: '', contacto: '', email: '', telefono: '', direccion: '' });
      cargarDatos();
    } catch { alert('Error al actualizar organización'); } finally { setEnviando(false); }
  };

  const toggleEstado = (org) => {
    setOrgAccionSeleccionada(org);
    setTipoAccionOrg(org.activo ? 'desactivar' : 'reactivar');
    setModalOrgAccion(true);
  };

  const confirmarAccionOrg = async () => {
    setConfirmandoOrg(true);
    try {
      if (tipoAccionOrg === 'desactivar') {
        await organizacionesApi.eliminar(orgAccionSeleccionada.id);
      } else {
        await organizacionesApi.reactivar(orgAccionSeleccionada.id);
      }
      setModalOrgAccion(false);
      setOrgAccionSeleccionada(null);
      cargarDatos();
    } catch { alert(`Error al ${tipoAccionOrg} organización`); } finally { setConfirmandoOrg(false); }
  };

  const crearUsuarioOrganizacion = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await organizacionesApi.crearUsuarioOrganizacion({
        ...formUsuario,
        organizacionId: Number(formUsuario.organizacionId)
      });
      setModalCrearUsuario(false);
      setFormUsuario({ nombre: '', apellido: '', email: '', password: '', organizacionId: '' });
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al crear usuario';
      alert(msg);
    } finally { setEnviando(false); }
  };

  if (cargando) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="m-0 text-sm text-gray-500">{organizaciones.length} organizaciones registradas</p>
        <div className="flex gap-2">
          <Boton onClick={() => setModalCrear(true)}>Nueva Organización</Boton>
          <Boton variante="primario" onClick={() => setModalCrearUsuario(true)}>Nuevo Usuario</Boton>
        </div>
      </div>

      {organizaciones.length === 0 ? (
        <p className="text-gray-400">No hay organizaciones registradas.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Contacto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Voluntarios</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Actividades</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 w-44">Acción</th>
              </tr>
            </thead>
            <tbody>
              {organizaciones.map((org) => (
                <tr key={org.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!org.activo ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{org.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{org.contacto}</td>
                  <td className="px-4 py-3 text-gray-600">{org.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{org.totalVoluntarios ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{org.totalActividades ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${org.activo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {org.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <Boton variante="secundario" onClick={() => setDetalleOrg(org)}>Ver</Boton>
                      <Boton variante="secundario" onClick={() => abrirEditar(org)}>Editar</Boton>
                      <button
                        onClick={() => toggleEstado(org)}
                        className={`bg-none border-none cursor-pointer text-sm hover:text-opacity-80 ${org.activo ? 'text-red-500' : 'text-green-600'}`}
                      >
                        {org.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalForm abierto={modalCrear} titulo="Nueva Organización" onCerrar={() => setModalCrear(false)} onSubmit={crearOrganizacion} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Contacto</label>
          <input className={estiloInput} value={formCrear.contacto} onChange={(e) => setFormCrear({ ...formCrear, contacto: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Email</label>
          <input type="email" className={estiloInput} value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Teléfono</label>
          <input className={estiloInput} value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Dirección</label>
          <input className={estiloInput} value={formCrear.direccion} onChange={(e) => setFormCrear({ ...formCrear, direccion: e.target.value })} />
        </div>
      </ModalForm>

      <ModalForm abierto={modalEditar} titulo="Editar Organización" onCerrar={() => { setModalEditar(false); setEditandoOrg(null); }} onSubmit={guardarEditar} enviando={enviando}>
        <div className="mb-3.5">
          <label className={estiloLabel}>Nombre</label>
          <input className={estiloInput} value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Descripción</label>
          <textarea className={`${estiloInput} min-h-[80px]`} value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Contacto</label>
          <input className={estiloInput} value={formCrear.contacto} onChange={(e) => setFormCrear({ ...formCrear, contacto: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Email</label>
          <input type="email" className={estiloInput} value={formCrear.email} onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })} required />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Teléfono</label>
          <input className={estiloInput} value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
        </div>
        <div className="mb-3.5">
          <label className={estiloLabel}>Dirección</label>
          <input className={estiloInput} value={formCrear.direccion} onChange={(e) => setFormCrear({ ...formCrear, direccion: e.target.value })} />
        </div>
      </ModalForm>

      <ModalForm abierto={modalCrearUsuario} titulo="Nuevo Usuario Organización" onCerrar={() => { setModalCrearUsuario(false); setFormUsuario({ nombre: '', apellido: '', email: '', password: '', organizacionId: '' }); }} onSubmit={crearUsuarioOrganizacion} enviando={enviando}>
        <p className="text-xs text-gray-500 mb-4 font-semibold">Seleccionar organización</p>
        <div className="mb-4">
          <label className={estiloLabel}>Organización</label>
          <select className={estiloInput} value={formUsuario.organizacionId} onChange={(e) => setFormUsuario({ ...formUsuario, organizacionId: e.target.value })} required>
            <option value="">Seleccionar organización...</option>
            {organizaciones.map((org) => (
              <option key={org.id} value={org.id}>{org.nombre}</option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-gray-200" />
        <p className="text-xs text-gray-500 mb-4 font-semibold">Datos del usuario</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={estiloLabel}>Nombre</label>
            <input className={estiloInput} value={formUsuario.nombre} onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} required />
          </div>
          <div>
            <label className={estiloLabel}>Apellido</label>
            <input className={estiloInput} value={formUsuario.apellido} onChange={(e) => setFormUsuario({ ...formUsuario, apellido: e.target.value })} required />
          </div>
        </div>
        <div className="mb-3">
          <label className={estiloLabel}>Email</label>
          <input type="email" className={estiloInput} value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} required />
        </div>
        <div className="mb-4">
          <label className={estiloLabel}>Contraseña</label>
          <input type="password" className={estiloInput} value={formUsuario.password} onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} required minLength={6} />
        </div>
      </ModalForm>

      {detalleOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetalleOrg(null)}>
          <div className="bg-white rounded-lg p-7 max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-4 text-lg text-gray-900">{detalleOrg.nombre}</h3>
            <p className="m-0 mb-4 text-sm text-gray-600 leading-relaxed">{detalleOrg.descripcion}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <span><strong>Contacto:</strong> {detalleOrg.contacto}</span>
              <span><strong>Email:</strong> {detalleOrg.email}</span>
              <span><strong>Teléfono:</strong> {detalleOrg.telefono || '—'}</span>
              <span><strong>Dirección:</strong> {detalleOrg.direccion || '—'}</span>
              <span><strong>Voluntarios:</strong> {detalleOrg.totalVoluntarios}</span>
              <span><strong>Actividades:</strong> {detalleOrg.totalActividades}</span>
            </div>
            <div className="text-right">
              <Boton variante="secundario" onClick={() => setDetalleOrg(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacion
        abierto={modalOrgAccion}
        titulo={tipoAccionOrg === 'desactivar' ? 'Desactivar organización' : 'Reactivar organización'}
        mensaje={tipoAccionOrg === 'desactivar'
          ? '¿Desactivar esta organización? La organización dejará de estar operativa pero se conservará su historial.'
          : '¿Reactivar esta organización? Volverá a estar operativa.'}
        onConfirmar={confirmarAccionOrg}
        onCancelar={() => { setModalOrgAccion(false); setOrgAccionSeleccionada(null); }}
        confirmando={confirmandoOrg}
        textoConfirmar={tipoAccionOrg === 'desactivar' ? 'Desactivar' : 'Activar'}
        textoProcesando={tipoAccionOrg === 'desactivar' ? 'Desactivando...' : 'Activando...'}
      />
    </div>
  );
}

function VoluntariosTab() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [accionVoluntario, setAccionVoluntario] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await voluntariosApi.obtenerTodos();
        setDatos(res.data);
      } catch { alert(MENSAJES.ERROR_CARGA); } finally { setCargando(false); }
    })();
  }, []);

  const recargarDatos = async () => {
    try {
      const res = await voluntariosApi.obtenerTodos();
      setDatos(res.data);
    } catch { alert(MENSAJES.ERROR_CARGA); }
  };

  const datosFiltrados = busqueda
    ? datos.filter((v) =>
        `${v.nombre} ${v.apellido} ${v.email}`.toLowerCase().includes(busqueda.toLowerCase())
      )
    : datos;

  const toggleEstadoVoluntario = (vol) => {
    const esActivo = vol.estado === 'Activo';
    setAccionVoluntario(esActivo ? 'desactivar' : 'reactivar');
    setIdSeleccionado(vol.id);
    setModalAbierto(true);
  };

  const confirmarAccion = async () => {
    setConfirmando(true);
    try {
      if (accionVoluntario === 'desactivar') {
        await voluntariosApi.eliminar(idSeleccionado);
      } else {
        await voluntariosApi.reactivar(idSeleccionado);
      }
      setModalAbierto(false);
      setIdSeleccionado(null);
      recargarDatos();
    } catch { alert('Error al cambiar estado del voluntario'); } finally { setConfirmando(false); }
  };

  if (cargando) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="m-0 text-sm text-gray-500">{datos.length} voluntarios registrados</p>
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar voluntario..." />
      </div>

      {datosFiltrados.length === 0 ? (
        <p className="text-gray-400">No hay voluntarios registrados.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Apellido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Teléfono</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Horas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Organización</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 w-20">Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((v) => {
                const esActivo = v.estado === 'Activo';
                const cfg = ESTADOS_VOLUNTARIO[v.estado] ?? { label: v.estado, color: '#6b7280' };
                return (
                  <tr key={v.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!esActivo ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 text-gray-900">{v.nombre}</td>
                    <td className="px-4 py-3 text-gray-900">{v.apellido}</td>
                    <td className="px-4 py-3 text-gray-600">{v.email}</td>
                    <td className="px-4 py-3 text-gray-600">{v.telefono || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.color + '20', color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{Number(v.horasTotales).toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{v.nombreOrganizacion || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleEstadoVoluntario(v)}
                        className={`bg-none border-none cursor-pointer text-sm hover:text-opacity-80 ${esActivo ? 'text-red-500' : 'text-green-600'}`}
                      >
                        {esActivo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo={accionVoluntario === 'desactivar' ? 'Desactivar voluntario' : 'Reactivar voluntario'}
        mensaje={accionVoluntario === 'desactivar'
          ? '¿Desactivar este voluntario? El voluntario dejará de poder operar pero se conservará su historial.'
          : '¿Reactivar este voluntario? Volverá a estar operativo.'}
        onConfirmar={confirmarAccion}
        onCancelar={() => { setModalAbierto(false); setIdSeleccionado(null); }}
        confirmando={confirmando}
        textoConfirmar={accionVoluntario === 'desactivar' ? 'Desactivar' : 'Activar'}
        textoProcesando={accionVoluntario === 'desactivar' ? 'Desactivando...' : 'Activando...'}
      />
    </div>
  );
}

function CuentasTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroRol, setFiltroRol] = useState('');

  const ROLES = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'organizacion', label: 'Organización' },
    { value: 'voluntario', label: 'Voluntario' }
  ];

  const COLORS = {
    Admin: '#7c3aed',
    Organizacion: '#2563eb',
    Voluntario: '#059669'
  };

  useEffect(() => {
    (async () => {
      setCargando(true);
      try {
        const params = filtroRol ? { rol: filtroRol } : {};
        const res = await adminApi.obtenerUsuarios(params);
        setUsuarios(res.data);
      } catch { alert(MENSAJES.ERROR_CARGA); } finally { setCargando(false); }
    })();
  }, [filtroRol]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="m-0 text-sm text-gray-500">{usuarios.length} cuentas registradas</p>
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-gray-400">No hay cuentas registradas.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Apellido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Organización</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Activo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Registro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-900">{u.apellido}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: COLORS[u.rol] || '#6b7280' }}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.nombreOrganizacion || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${u.activo ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {u.activo ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.fechaRegistro).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;
