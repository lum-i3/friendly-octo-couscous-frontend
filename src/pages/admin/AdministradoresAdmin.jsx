import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import FormInput from '../../components/FormInput';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems.jsx';
import { getTokenRole } from '../../utils/auth';
import { REGEX_USUARIO, REGEX_CORREO, REGEX_NOMBRE } from '../../utils/validaciones';
import OjoAbierto from '../../assets/Icons/OjoAbierto.png';
import EditarIcon from '../../assets/Icons/EditarIcon.png';
import CambiarEstadoIcon from '../../assets/Icons/CambiarEstadoIcon.png';
import CheckIcon from '../../assets/Icons/CheckIcon.png';
import CrossIcon from '../../assets/Icons/CrossIcon.png';
import BuscadorIcon from '../../assets/Icons/BuscadorIcon.png';
import PaginacionBack from '../../assets/Icons/PaginacionBack.png';
import PaginacionNext from '../../assets/Icons/PaginacionNext.png';
import UserIcon from '../../assets/Icons/UserIcon.png';
import '../../styles/dashboard.css';
import '../../styles/admin.css';
import '../../styles/perfil.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 10;

const ESTADO_LABEL = {
    ACTIVO: 'Activo', INACTIVO: 'Inactivo', BLOQUEADO: 'Bloqueado', SIN_CONFIRMAR: 'Sin confirmar',
};

function badgeClass(estado) {
    return `admin-badge admin-badge--${(estado ?? '').toLowerCase().replace('_', '-')}`;
}

function fmtFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function generarPaginas(pagina, totalPaginas) {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i);
    const set = new Set([0, totalPaginas - 1]);
    for (let i = Math.max(0, pagina - 1); i <= Math.min(totalPaginas - 1, pagina + 1); i++) set.add(i);
    return [...set].sort((a, b) => a - b);
}

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/* ── Formulario de creación de administrador ── */
const FORM_INICIAL = {
    nombreUsuario: '', correo: '', nombreCompleto: '',
    tipoAdministrador: 'ADMINISTRADOR', contraseniaConfirmacion: '',
};

function AdministradoresAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();
    const esSuperAdmin = getTokenRole() === 'SUPERADMINISTRADOR';

    /* ── Estado de tabla ── */
    const [admins, setAdmins] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [accesoDenegado, setAccesoDenegado] = useState(false);
    const [errorTabla, setErrorTabla] = useState(null);

    /* ── Filtros cliente ── */
    const [busqueda, setBusqueda] = useState('');
    const [orden, setOrden] = useState('asc');
    const [pagina, setPagina] = useState(0);

    /* ── Modal: 'ver' | 'editar' | 'crear' | null ── */
    const [modal, setModal] = useState(null);
    const [adminSeleccionado, setAdminSeleccionado] = useState(null);
    const [nuevoTipo, setNuevoTipo] = useState('ADMINISTRADOR');
    const [guardando, setGuardando] = useState(false);

    /* ── Formulario de creación ── */
    const [form, setForm] = useState(FORM_INICIAL);
    const [formErrs, setFormErrs] = useState({});
    const [creando, setCreando] = useState(false);

    /* ── Carga ── */
    const cargarAdmins = useCallback(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }
        setCargando(true);
        setErrorTabla(null);
        fetch(`${BASE_URL}/api/admin/administradores`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 403) { setAccesoDenegado(true); setCargando(false); return null; }
                return res.ok ? res.json() : Promise.reject(new Error('Error del servidor'));
            })
            .then(json => {
                if (json) { setAdmins(json.datos ?? []); setCargando(false); }
            })
            .catch(() => { setErrorTabla('No se pudo cargar la lista de administradores.'); setCargando(false); });
    }, []);

    useEffect(() => { cargarAdmins(); }, [cargarAdmins]);

    /* ── Filtro + sort + paginación (cliente) ── */
    const adminsFiltrados = useMemo(() => {
        let result = [...admins];
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            result = result.filter(a =>
                (a.nombreCompleto ?? '').toLowerCase().includes(q) ||
                (a.nombreUsuario ?? '').toLowerCase().includes(q) ||
                (a.correo ?? '').toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            const cmp = (a.nombreCompleto ?? '').localeCompare(b.nombreCompleto ?? '', 'es');
            return orden === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [admins, busqueda, orden]);

    const totalPaginas = Math.ceil(adminsFiltrados.length / PAGE_SIZE);
    const adminsPagina = adminsFiltrados.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
    const paginas = generarPaginas(pagina, totalPaginas);

    /* Resetear página al filtrar */
    const handleBusqueda = (e) => { setBusqueda(e.target.value); setPagina(0); };
    const handleOrden = () => { setOrden(o => o === 'asc' ? 'desc' : 'asc'); setPagina(0); };

    /* ── Cambiar tipo de administrador ── */
    const handleGuardarTipo = useCallback(async () => {
        if (!adminSeleccionado) return;
        if (nuevoTipo === adminSeleccionado.tipoAdministrador) { setModal(null); return; }

        const { isConfirmed } = await Swal.fire({
            title: '¿Cambiar tipo de administrador?',
            html: `<strong>${adminSeleccionado.nombreCompleto || adminSeleccionado.nombreUsuario}</strong> pasará a ser <strong>${nuevoTipo === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador'}</strong>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
        });
        if (!isConfirmed) return;

        setGuardando(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/administradores/${adminSeleccionado.idAdministrador}/tipo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nuevoTipo }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al cambiar tipo');
            await Swal.fire({ icon: 'success', title: 'Tipo actualizado', timer: 1500, showConfirmButton: false });
            setModal(null);
            cargarAdmins();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setGuardando(false);
        }
    }, [adminSeleccionado, nuevoTipo, cargarAdmins]);

    /* ── Cambiar estado ── */
    const handleCambiarEstado = useCallback(async (admin) => {
        const estadoActual = admin.estadoUsuario;
        const opciones = ['ACTIVO', 'INACTIVO', 'BLOQUEADO']
            .filter(e => e !== estadoActual)
            .map(e => `<option value="${e}">${ESTADO_LABEL[e]}</option>`)
            .join('');

        const { value, isConfirmed } = await Swal.fire({
            title: 'Cambiar estado',
            html: `
                <p style="margin:0 0 12px;font-size:0.88rem;text-align:left">
                    Admin: <strong>${admin.nombreCompleto || admin.nombreUsuario}</strong><br/>
                    Estado actual: <strong>${ESTADO_LABEL[estadoActual] ?? estadoActual}</strong>
                </p>
                <label style="display:block;text-align:left;font-size:0.82rem;font-weight:600;margin-bottom:4px">Nuevo estado</label>
                <select id="swal-nuevo-estado" class="swal2-select" style="margin:0 0 10px;width:100%">${opciones}</select>
                <label style="display:block;text-align:left;font-size:0.82rem;font-weight:600;margin-bottom:4px">Motivo (opcional)</label>
                <input id="swal-motivo" class="swal2-input" style="margin:0" placeholder="Motivo del cambio" />
            `,
            confirmButtonText: 'Cambiar estado',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
            preConfirm: () => ({
                nuevoEstado: document.getElementById('swal-nuevo-estado').value,
                motivo: document.getElementById('swal-motivo').value || null,
            }),
        });
        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/usuarios/${admin.idUsuario}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(value),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al cambiar estado');
            await Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
            cargarAdmins();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    }, [cargarAdmins]);

    /* ── Validación de formulario de creación ── */
    const validarForm = () => {
        const errs = {};
        if (!form.nombreUsuario.trim()) {
            errs.nombreUsuario = 'El nombre de usuario es obligatorio.';
        } else if (form.nombreUsuario.length < 3 || form.nombreUsuario.length > 60) {
            errs.nombreUsuario = 'Debe tener entre 3 y 60 caracteres.';
        } else if (!REGEX_USUARIO.test(form.nombreUsuario)) {
            errs.nombreUsuario = 'Solo letras, números, puntos, guiones y guiones bajos.';
        }
        if (!form.correo.trim()) {
            errs.correo = 'El correo es obligatorio.';
        } else if (!REGEX_CORREO.test(form.correo)) {
            errs.correo = 'Ingresa un correo electrónico válido.';
        } else if (form.correo.length > 60) {
            errs.correo = 'Máximo 60 caracteres.';
        }
        if (!form.nombreCompleto.trim()) {
            errs.nombreCompleto = 'El nombre completo es obligatorio.';
        } else if (form.nombreCompleto.length > 90) {
            errs.nombreCompleto = 'Máximo 90 caracteres.';
        } else if (!REGEX_NOMBRE.test(form.nombreCompleto.trim())) {
            errs.nombreCompleto = 'Solo letras y espacios.';
        }
        if (!form.contraseniaConfirmacion.trim()) {
            errs.contraseniaConfirmacion = 'Ingresa tu contraseña para confirmar la acción.';
        }
        setFormErrs(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Crear administrador ── */
    const handleCrear = useCallback(async () => {
        if (!validarForm()) return;

        const { isConfirmed } = await Swal.fire({
            title: '¿Crear administrador?',
            html: `Se creará la cuenta para <strong>${form.nombreCompleto}</strong> como <strong>${form.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador'}</strong>. Sus credenciales serán enviadas por correo.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
        });
        if (!isConfirmed) return;

        setCreando(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/administradores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    nombreUsuario:         form.nombreUsuario.trim(),
                    correo:                form.correo.trim(),
                    nombreCompleto:        form.nombreCompleto.trim(),
                    tipoAdministrador:     form.tipoAdministrador,
                    contraseniaConfirmacion: form.contraseniaConfirmacion,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al crear administrador');
            await Swal.fire({ icon: 'success', title: 'Administrador creado', text: json.mensaje, timer: 2500, showConfirmButton: false });
            setModal(null);
            setForm(FORM_INICIAL);
            setFormErrs({});
            cargarAdmins();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setCreando(false);
        }
    }, [form, cargarAdmins]);

    /* ── Logout ── */
    const handleLogout = useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Cerrar sesión?', icon: 'question', showCancelButton: true,
            confirmButtonText: 'Cerrar sesión', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#E94E50', cancelButtonColor: '#176682',
        });
        if (isConfirmed) { localStorage.removeItem('jwt'); navigate('/login', { replace: true }); }
    }, [navigate]);

    const sidebarUser = perfil ? { nombre: perfil.nombreCompleto || perfil.nombreUsuario, foto: perfil.fotoPerfil || null } : null;

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    /* ── Campo en modo solo-lectura para el modal de ver ── */
    const CampoVer = ({ label, valor }) => (
        <div className="admin-modal__campo">
            <span className="admin-modal__campo-label">{label}</span>
            <span className="admin-modal__campo-valor">{valor || '—'}</span>
        </div>
    );

    /* ── Render ── */
    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout navItems={ADMIN_ITEMS} user={sidebarUser} titulo="Administradores activos" actions={headerActions}>

                    {accesoDenegado ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'Inter, system-ui, sans-serif', color: '#6b7a80' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10475C', marginBottom: 8 }}>Acceso restringido</p>
                            <p style={{ fontSize: '0.88rem' }}>Esta sección es exclusiva para superadministradores.</p>
                        </div>
                    ) : (
                        <div className="admin-tabla-container">
                            {errorTabla && !cargando && (
                                <div className="dashboard-error">
                                    <span>{errorTabla}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                <h2 className="admin-tabla-titulo" style={{ margin: 0 }}>Últimos administradores registrados</h2>
                                {esSuperAdmin && (
                                    <button
                                        className="editar-perfil-btn"
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.84rem' }}
                                        onClick={() => { setForm(FORM_INICIAL); setFormErrs({}); setModal('crear'); }}
                                    >
                                        <PlusIcon /> Nuevo administrador
                                    </button>
                                )}
                            </div>

                            {/* Filtros */}
                            <div className="admin-filtros">
                                <div className="admin-filtros__search">
                                    <img src={BuscadorIcon} alt="" className="admin-filtros__search-icon" />
                                    <input
                                        type="text"
                                        className="admin-filtros__search-input"
                                        placeholder="Buscar por nombre, usuario o correo…"
                                        value={busqueda}
                                        onChange={handleBusqueda}
                                    />
                                </div>
                                <button
                                    className={`admin-filtros__sort-btn${orden === 'desc' ? ' admin-filtros__sort-btn--activo' : ''}`}
                                    onClick={handleOrden}
                                >
                                    {orden === 'asc' ? 'A → Z' : 'Z → A'}
                                </button>
                            </div>

                            {/* Tabla */}
                            <div className="admin-tabla-wrapper">
                                <table className="admin-tabla">
                                    <thead>
                                        <tr>
                                            <th>Nombre completo</th>
                                            <th>Nombre de usuario</th>
                                            <th>Correo electrónico</th>
                                            <th>Estado</th>
                                            <th style={{ textAlign: 'center' }}>SuperAdmin</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cargando ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="admin-tabla__skeleton">
                                                    <td>████████████</td>
                                                    <td>████████</td>
                                                    <td>██████████████</td>
                                                    <td>██████</td>
                                                    <td style={{ textAlign: 'center' }}>●</td>
                                                    <td>○ ○ ○</td>
                                                </tr>
                                            ))
                                        ) : adminsPagina.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="admin-tabla__empty">
                                                    {busqueda ? 'No se encontraron administradores.' : 'No hay administradores registrados.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            adminsPagina.map(a => (
                                                <tr key={a.idAdministrador}>
                                                    <td>
                                                        <div className="admin-tabla__nombre">{a.nombreCompleto || '—'}</div>
                                                    </td>
                                                    <td>@{a.nombreUsuario}</td>
                                                    <td>{a.correo}</td>
                                                    <td>
                                                        <span className={badgeClass(a.estadoUsuario)}>
                                                            {ESTADO_LABEL[a.estadoUsuario] ?? a.estadoUsuario}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="admin-permiso">
                                                            <img
                                                                src={a.tipoAdministrador === 'SUPERADMINISTRADOR' ? CheckIcon : CrossIcon}
                                                                alt={a.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Sí' : 'No'}
                                                                className="admin-permiso__icon"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="admin-acciones">
                                                            <button
                                                                className="admin-accion-btn"
                                                                title="Ver detalle"
                                                                onClick={() => { setAdminSeleccionado(a); setModal('ver'); }}
                                                            >
                                                                <img src={OjoAbierto} alt="Ver" className="admin-accion-btn__icon" />
                                                            </button>
                                                            {esSuperAdmin && (
                                                                <button
                                                                    className="admin-accion-btn"
                                                                    title="Editar tipo"
                                                                    onClick={() => { setAdminSeleccionado(a); setNuevoTipo(a.tipoAdministrador); setModal('editar'); }}
                                                                >
                                                                    <img src={EditarIcon} alt="Editar" className="admin-accion-btn__icon" />
                                                                </button>
                                                            )}
                                                            {esSuperAdmin && (
                                                                <button
                                                                    className="admin-accion-btn"
                                                                    title="Cambiar estado"
                                                                    onClick={() => handleCambiarEstado(a)}
                                                                >
                                                                    <img src={CambiarEstadoIcon} alt="Estado" className="admin-accion-btn__icon" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <>
                                    <div className="admin-paginacion">
                                        <button className="admin-paginacion__btn" disabled={pagina === 0} onClick={() => setPagina(0)} title="Primera">
                                            <img src={PaginacionBack} alt="«" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1) translateX(2px)' }} />
                                            <img src={PaginacionBack} alt="" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1)', marginLeft: '-4px' }} />
                                        </button>
                                        <button className="admin-paginacion__btn" disabled={pagina === 0} onClick={() => setPagina(p => p - 1)} title="Anterior">
                                            <img src={PaginacionBack} alt="‹" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1)' }} />
                                        </button>
                                        {paginas.reduce((acc, p, i, arr) => {
                                            if (i > 0 && arr[i] - arr[i - 1] > 1) acc.push(<span key={`d${i}`} className="admin-paginacion__dots">···</span>);
                                            acc.push(
                                                <button key={p} className={`admin-paginacion__btn${p === pagina ? ' admin-paginacion__btn--activo' : ''}`} onClick={() => setPagina(p)}>{p + 1}</button>
                                            );
                                            return acc;
                                        }, [])}
                                        <button className="admin-paginacion__btn" disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)} title="Siguiente">
                                            <img src={PaginacionNext} alt="›" className="admin-paginacion__nav-icon" />
                                        </button>
                                        <button className="admin-paginacion__btn" disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(totalPaginas - 1)} title="Última">
                                            <img src={PaginacionNext} alt="" className="admin-paginacion__nav-icon" />
                                            <img src={PaginacionNext} alt="»" className="admin-paginacion__nav-icon" style={{ marginLeft: '-4px' }} />
                                        </button>
                                    </div>
                                    <p className="admin-paginacion__info">{adminsFiltrados.length} administradores</p>
                                </>
                            )}
                        </div>
                    )}

                </SidebarLayout>
            </div>

            {/* ── Modal: Ver detalle ── */}
            {modal === 'ver' && adminSeleccionado && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__titulo">Detalle de administrador</h3>
                            <button className="admin-modal__close" onClick={() => setModal(null)}>×</button>
                        </div>
                        <div className="admin-modal__perfil">
                            <img src={UserIcon} alt="" className="admin-modal__foto" style={{ objectFit: 'contain', padding: 6, background: '#f0f4f5' }} />
                            <div>
                                <p className="admin-modal__nombre-completo">{adminSeleccionado.nombreCompleto || '—'}</p>
                                <p className="admin-modal__username">@{adminSeleccionado.nombreUsuario}</p>
                            </div>
                        </div>
                        <div className="admin-modal__campos">
                            <CampoVer label="Correo electrónico" valor={adminSeleccionado.correo} />
                            <CampoVer label="Tipo" valor={adminSeleccionado.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador'} />
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Estado</span>
                                <span className={badgeClass(adminSeleccionado.estadoUsuario)}>
                                    {ESTADO_LABEL[adminSeleccionado.estadoUsuario] ?? adminSeleccionado.estadoUsuario}
                                </span>
                            </div>
                        </div>
                        <div className="admin-modal__footer">
                            <button className="admin-modal__btn admin-modal__btn--primario" onClick={() => setModal(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Editar tipo ── */}
            {modal === 'editar' && adminSeleccionado && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__titulo">Editar tipo de administrador</h3>
                            <button className="admin-modal__close" onClick={() => setModal(null)}>×</button>
                        </div>
                        <div className="admin-modal__perfil">
                            <img src={UserIcon} alt="" className="admin-modal__foto" style={{ objectFit: 'contain', padding: 6, background: '#f0f4f5' }} />
                            <div>
                                <p className="admin-modal__nombre-completo">{adminSeleccionado.nombreCompleto || '—'}</p>
                                <p className="admin-modal__username">@{adminSeleccionado.nombreUsuario}</p>
                            </div>
                        </div>
                        <div className="admin-modal__campos">
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Tipo actual</span>
                                <span className="admin-modal__campo-valor">
                                    {adminSeleccionado.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador'}
                                </span>
                            </div>
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Nuevo tipo</span>
                                <select
                                    value={nuevoTipo}
                                    onChange={e => setNuevoTipo(e.target.value)}
                                    style={{ padding: '6px 10px', border: '1.5px solid #D8E7E9', borderRadius: 8, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.84rem', color: '#10475C', background: '#f9fbfc', outline: 'none' }}
                                >
                                    <option value="ADMINISTRADOR">Administrador</option>
                                    <option value="SUPERADMINISTRADOR">Superadministrador</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal__footer">
                            <button className="admin-modal__btn admin-modal__btn--secundario" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="admin-modal__btn admin-modal__btn--primario" onClick={handleGuardarTipo} disabled={guardando}>
                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Crear administrador ── */}
            {modal === 'crear' && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="admin-modal" style={{ maxWidth: 520 }}>
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__titulo">Nuevo administrador</h3>
                            <button className="admin-modal__close" onClick={() => setModal(null)}>×</button>
                        </div>
                        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormInput
                                label="Nombre de usuario"
                                name="nombreUsuario"
                                value={form.nombreUsuario}
                                onChange={e => { setForm(p => ({ ...p, nombreUsuario: e.target.value })); if (formErrs.nombreUsuario) setFormErrs(p => ({ ...p, nombreUsuario: '' })); }}
                                error={formErrs.nombreUsuario}
                                placeholder="usuario123"
                            />
                            <FormInput
                                label="Correo electrónico"
                                name="correo"
                                type="email"
                                value={form.correo}
                                onChange={e => { setForm(p => ({ ...p, correo: e.target.value })); if (formErrs.correo) setFormErrs(p => ({ ...p, correo: '' })); }}
                                error={formErrs.correo}
                                placeholder="correo@ejemplo.com"
                            />
                            <FormInput
                                label="Nombre completo"
                                name="nombreCompleto"
                                value={form.nombreCompleto}
                                onChange={e => { setForm(p => ({ ...p, nombreCompleto: e.target.value })); if (formErrs.nombreCompleto) setFormErrs(p => ({ ...p, nombreCompleto: '' })); }}
                                error={formErrs.nombreCompleto}
                                placeholder="Nombre Apellido"
                            />
                            <div className="field">
                                <div className="field-label-row">
                                    <label className="field-label">Tipo de administrador</label>
                                </div>
                                <div className="field-input-wrapper">
                                    <select
                                        value={form.tipoAdministrador}
                                        onChange={e => setForm(p => ({ ...p, tipoAdministrador: e.target.value }))}
                                        className="field-input"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="ADMINISTRADOR">Administrador</option>
                                        <option value="SUPERADMINISTRADOR">Superadministrador</option>
                                    </select>
                                </div>
                                {formErrs.tipoAdministrador && <p className="field-error-text">{formErrs.tipoAdministrador}</p>}
                            </div>
                            <FormInput
                                label="Tu contraseña (confirmación)"
                                name="contraseniaConfirmacion"
                                type="password"
                                value={form.contraseniaConfirmacion}
                                onChange={e => { setForm(p => ({ ...p, contraseniaConfirmacion: e.target.value })); if (formErrs.contraseniaConfirmacion) setFormErrs(p => ({ ...p, contraseniaConfirmacion: '' })); }}
                                error={formErrs.contraseniaConfirmacion}
                                placeholder="••••••••"
                            />
                            <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#6b7a80', fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Las credenciales de acceso serán enviadas por correo al nuevo administrador.
                            </p>
                        </div>
                        <div className="admin-modal__footer">
                            <button className="admin-modal__btn admin-modal__btn--secundario" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="admin-modal__btn admin-modal__btn--primario" onClick={handleCrear} disabled={creando}>
                                {creando ? 'Creando…' : 'Crear administrador'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdministradoresAdmin;
