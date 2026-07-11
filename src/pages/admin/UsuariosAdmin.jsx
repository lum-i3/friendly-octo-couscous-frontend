import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems';
import OjoAbierto from '../../assets/Icons/OjoAbierto.png';
import EditarIcon from '../../assets/Icons/EditarIcon.png';
import CambiarEstadoIcon from '../../assets/Icons/CambiarEstadoIcon.png';
import CheckIcon from '../../assets/Icons/CheckIcon.png';
import CrossIcon from '../../assets/Icons/CrossIcon.png';
import BuscadorIcon from '../../assets/Icons/BuscadorIcon.png';
import UserIcon from '../../assets/Icons/UserIcon.png';
import PaginacionBack from '../../assets/Icons/PaginacionBack.png';
import PaginacionNext from '../../assets/Icons/PaginacionNext.png';
import '../../styles/dashboard.css';
import '../../styles/admin.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 20;

const ESTADO_LABEL = {
    ACTIVO: 'Activo',
    INACTIVO: 'Inactivo',
    BLOQUEADO: 'Bloqueado',
    SIN_CONFIRMAR: 'Sin confirmar',
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

function toFotoSrc(foto) {
    if (!foto) return null;
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto;
    return `data:image/jpeg;base64,${foto}`;
}

function generarPaginas(pagina, totalPaginas) {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i);
    const set = new Set([0, totalPaginas - 1]);
    for (let i = Math.max(0, pagina - 1); i <= Math.min(totalPaginas - 1, pagina + 1); i++) {
        set.add(i);
    }
    return [...set].sort((a, b) => a - b);
}

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function UsuariosAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Estado de tabla ── */
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);
    const [busqueda, setBusqueda] = useState('');
    const [termino, setTermino] = useState('');
    const [orden, setOrden] = useState('asc');
    const searchTimer = useRef(null);

    /* ── Estado de modal ── */
    const [modal, setModal] = useState(null);   // null | { modo: 'ver'|'editar', usuario: UserDetailDTO }
    const [modalCargando, setModalCargando] = useState(false);
    const [permisoEdit, setPermisoEdit] = useState(false);
    const [guardando, setGuardando] = useState(false);

    /* ── Carga de usuarios ── */
    const cargarUsuarios = useCallback(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }
        setCargando(true);
        const qs = new URLSearchParams({ page: pagina, size: PAGE_SIZE });
        if (termino) qs.set('termino', termino);
        fetch(`${BASE_URL}/api/admin/usuarios?${qs}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                setUsuarios(json?.datos?.contenido ?? []);
                setTotalPaginas(json?.datos?.totalPaginas ?? 0);
                setTotalElementos(json?.datos?.totalElementos ?? 0);
                setCargando(false);
            })
            .catch(() => setCargando(false));
    }, [pagina, termino]);

    useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

    /* ── Búsqueda debounced ── */
    const handleBusqueda = (e) => {
        const val = e.target.value;
        setBusqueda(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setTermino(val);
            setPagina(0);
        }, 400);
    };

    /* ── Sort cliente ── */
    const usuariosOrdenados = useMemo(() => {
        if (!usuarios.length) return [];
        return [...usuarios].sort((a, b) => {
            const cmp = (a.nombreCompleto ?? '').localeCompare(b.nombreCompleto ?? '', 'es');
            return orden === 'asc' ? cmp : -cmp;
        });
    }, [usuarios, orden]);

    /* ── Abrir modal (carga detalle completo) ── */
    const abrirModal = useCallback(async (idUsuario, modo) => {
        setModalCargando(true);
        setModal({ modo, usuario: null });
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/usuarios/${idUsuario}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error');
            const u = json.datos;
            setModal({ modo, usuario: u });
            if (modo === 'editar') {
                setPermisoEdit(u.tienePermisoDescarga);
            }
        } catch {
            setModal(null);
        } finally {
            setModalCargando(false);
        }
    }, []);

    const cerrarModal = () => { setModal(null); setGuardando(false); };

    /* ── Guardar permiso (editar) ── */
    const handleGuardar = useCallback(async () => {
        if (!modal?.usuario) return;
        const { idUsuario, tienePermisoDescarga, nombreCompleto } = modal.usuario;

        if (permisoEdit === tienePermisoDescarga) { cerrarModal(); return; }

        const { isConfirmed } = await Swal.fire({
            title: '¿Guardar cambios?',
            html: `Se <strong>${permisoEdit ? 'activará' : 'desactivará'}</strong> el permiso de descarga de <strong>${nombreCompleto}</strong>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
        });
        if (!isConfirmed) return;

        setGuardando(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/usuarios/${idUsuario}/permiso-descarga`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nuevoPermiso: permisoEdit ? 'ACTIVO' : 'INACTIVO' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al guardar');
            await Swal.fire({ icon: 'success', title: 'Permiso actualizado', timer: 1500, showConfirmButton: false });
            cerrarModal();
            cargarUsuarios();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setGuardando(false);
        }
    }, [modal, permisoEdit, cargarUsuarios]);

    /* ── Cambiar estado ── */
    const handleCambiarEstado = useCallback(async (usuario) => {
        const estadoActual = usuario.estado;
        const opciones = ['ACTIVO', 'INACTIVO', 'BLOQUEADO']
            .filter(e => e !== estadoActual)
            .map(e => `<option value="${e}">${ESTADO_LABEL[e]}</option>`)
            .join('');

        const { value, isConfirmed } = await Swal.fire({
            title: 'Cambiar estado de usuario',
            html: `
                <p style="margin:0 0 12px;font-size:0.88rem;text-align:left">
                    Usuario: <strong>${usuario.nombreCompleto}</strong><br/>
                    Estado actual: <strong>${ESTADO_LABEL[estadoActual] ?? estadoActual}</strong>
                </p>
                <label style="display:block;text-align:left;font-size:0.82rem;font-weight:600;margin-bottom:4px">Nuevo estado</label>
                <select id="swal-nuevo-estado" class="swal2-select" style="margin:0 0 10px;width:100%">${opciones}</select>
                <label style="display:block;text-align:left;font-size:0.82rem;font-weight:600;margin-bottom:4px">Motivo (opcional)</label>
                <input id="swal-motivo-estado" class="swal2-input" style="margin:0" placeholder="Ej: Cuenta inactiva por inactividad" />
            `,
            confirmButtonText: 'Cambiar estado',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
            preConfirm: () => ({
                nuevoEstado: document.getElementById('swal-nuevo-estado').value,
                motivo: document.getElementById('swal-motivo-estado').value || null,
            }),
        });

        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/usuarios/${usuario.idUsuario}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(value),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al cambiar estado');
            await Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
            cargarUsuarios();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    }, [cargarUsuarios]);

    /* ── Logout ── */
    const handleLogout = useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#E94E50',
            cancelButtonColor: '#176682',
        });
        if (isConfirmed) { localStorage.removeItem('jwt'); navigate('/login', { replace: true }); }
    }, [navigate]);

    /* ── Sidebar ── */
    const sidebarUser = perfil ? { nombre: perfil.nombreCompleto || perfil.nombreUsuario, foto: perfil.fotoPerfil || null } : null;

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    /* ── Paginación ── */
    const paginas = generarPaginas(pagina, totalPaginas);

    /* ── Render ── */
    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout navItems={ADMIN_ITEMS} user={sidebarUser} titulo="Usuarios activos" actions={headerActions}>

                    <div className="admin-tabla-container">
                        <h2 className="admin-tabla-titulo">Últimos usuarios registrados</h2>

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
                                className={`admin-filtros__sort-btn${orden === 'asc' ? '' : ' admin-filtros__sort-btn--activo'}`}
                                onClick={() => setOrden(o => o === 'asc' ? 'desc' : 'asc')}
                                title="Ordenar por nombre"
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
                                        <th style={{ textAlign: 'center' }}>¿Tiene permiso de descarga?</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i} className="admin-tabla__skeleton">
                                                <td>████████████</td>
                                                <td>███████</td>
                                                <td>██████████████</td>
                                                <td>██████</td>
                                                <td style={{ textAlign: 'center' }}>●</td>
                                                <td>○ ○ ○</td>
                                            </tr>
                                        ))
                                    ) : usuariosOrdenados.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="admin-tabla__empty">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuariosOrdenados.map(u => (
                                            <tr key={u.idUsuario}>
                                                <td>
                                                    <div className="admin-tabla__nombre">{u.nombreCompleto || '—'}</div>
                                                    {u.esAdministrador && (
                                                        <div className="admin-tabla__sub">
                                                            {u.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>@{u.nombreUsuario}</td>
                                                <td>{u.correo}</td>
                                                <td>
                                                    <span className={badgeClass(u.estado)}>
                                                        {ESTADO_LABEL[u.estado] ?? u.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="admin-permiso">
                                                        <img
                                                            src={u.tienePermisoDescarga ? CheckIcon : CrossIcon}
                                                            alt={u.tienePermisoDescarga ? 'Sí' : 'No'}
                                                            className="admin-permiso__icon"
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="admin-acciones">
                                                        <button
                                                            className="admin-accion-btn"
                                                            title="Ver detalle"
                                                            onClick={() => abrirModal(u.idUsuario, 'ver')}
                                                        >
                                                            <img src={OjoAbierto} alt="Ver" className="admin-accion-btn__icon" />
                                                        </button>
                                                        <button
                                                            className="admin-accion-btn"
                                                            title="Editar permisos"
                                                            onClick={() => abrirModal(u.idUsuario, 'editar')}
                                                        >
                                                            <img src={EditarIcon} alt="Editar" className="admin-accion-btn__icon" />
                                                        </button>
                                                        <button
                                                            className="admin-accion-btn"
                                                            title="Cambiar estado"
                                                            onClick={() => handleCambiarEstado(u)}
                                                        >
                                                            <img src={CambiarEstadoIcon} alt="Estado" className="admin-accion-btn__icon" />
                                                        </button>
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
                                    <button
                                        className="admin-paginacion__btn"
                                        disabled={pagina === 0}
                                        onClick={() => setPagina(0)}
                                        title="Primera página"
                                    >
                                        <img src={PaginacionBack} alt="«" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1) translateX(2px)' }} />
                                        <img src={PaginacionBack} alt="" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1)', marginLeft: '-4px' }} />
                                    </button>
                                    <button
                                        className="admin-paginacion__btn"
                                        disabled={pagina === 0}
                                        onClick={() => setPagina(p => Math.max(0, p - 1))}
                                        title="Página anterior"
                                    >
                                        <img src={PaginacionBack} alt="‹" className="admin-paginacion__nav-icon" style={{ transform: 'scaleX(-1)' }} />
                                    </button>

                                    {paginas.reduce((acc, p, i, arr) => {
                                        if (i > 0 && arr[i] - arr[i - 1] > 1) {
                                            acc.push(<span key={`dots-${i}`} className="admin-paginacion__dots">···</span>);
                                        }
                                        acc.push(
                                            <button
                                                key={p}
                                                className={`admin-paginacion__btn${p === pagina ? ' admin-paginacion__btn--activo' : ''}`}
                                                onClick={() => setPagina(p)}
                                            >
                                                {p + 1}
                                            </button>
                                        );
                                        return acc;
                                    }, [])}

                                    <button
                                        className="admin-paginacion__btn"
                                        disabled={pagina >= totalPaginas - 1}
                                        onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                                        title="Página siguiente"
                                    >
                                        <img src={PaginacionNext} alt="›" className="admin-paginacion__nav-icon" />
                                    </button>
                                    <button
                                        className="admin-paginacion__btn"
                                        disabled={pagina >= totalPaginas - 1}
                                        onClick={() => setPagina(totalPaginas - 1)}
                                        title="Última página"
                                    >
                                        <img src={PaginacionNext} alt="" className="admin-paginacion__nav-icon" />
                                        <img src={PaginacionNext} alt="»" className="admin-paginacion__nav-icon" style={{ marginLeft: '-4px' }} />
                                    </button>
                                </div>
                                <p className="admin-paginacion__info">
                                    Página {pagina + 1} de {totalPaginas} · {totalElementos} usuarios
                                </p>
                            </>
                        )}
                    </div>

                </SidebarLayout>
            </div>

            {/* ── Modal de detalle / edición ── */}
            {modal !== null && (
                <div
                    className="admin-modal-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
                >
                    <div className="admin-modal">
                        {/* Header */}
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__titulo">
                                {modal.modo === 'ver' ? 'Detalle de usuario' : 'Editar permisos'}
                            </h3>
                            <button className="admin-modal__close" onClick={cerrarModal}>×</button>
                        </div>

                        {modalCargando || !modal.usuario ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7a80', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.84rem' }}>
                                Cargando…
                            </div>
                        ) : (
                            <>
                                {/* Foto + nombre */}
                                <div className="admin-modal__perfil">
                                    <img
                                        src={toFotoSrc(modal.usuario.fotoPerfil) ?? UserIcon}
                                        alt=""
                                        className="admin-modal__foto"
                                    />
                                    <div>
                                        <p className="admin-modal__nombre-completo">{modal.usuario.nombreCompleto || '—'}</p>
                                        <p className="admin-modal__username">@{modal.usuario.nombreUsuario}</p>
                                    </div>
                                </div>

                                {/* Campos */}
                                <div className="admin-modal__campos">
                                    <div className="admin-modal__campo">
                                        <span className="admin-modal__campo-label">Correo electrónico</span>
                                        <span className="admin-modal__campo-valor">{modal.usuario.correo}</span>
                                    </div>
                                    <div className="admin-modal__campo">
                                        <span className="admin-modal__campo-label">Estado</span>
                                        <span className={badgeClass(modal.usuario.estado)}>
                                            {ESTADO_LABEL[modal.usuario.estado] ?? modal.usuario.estado}
                                        </span>
                                    </div>
                                    <div className="admin-modal__campo">
                                        <span className="admin-modal__campo-label">Tipo de cuenta</span>
                                        <span className="admin-modal__campo-valor">
                                            {modal.usuario.esAdministrador
                                                ? (modal.usuario.tipoAdministrador === 'SUPERADMINISTRADOR' ? 'Superadministrador' : 'Administrador')
                                                : 'Usuario'}
                                        </span>
                                    </div>
                                    <div className="admin-modal__campo">
                                        <span className="admin-modal__campo-label">Fecha de registro</span>
                                        <span className="admin-modal__campo-valor">{fmtFecha(modal.usuario.fechaRegistro)}</span>
                                    </div>
                                    <div className="admin-modal__campo">
                                        <span className="admin-modal__campo-label">Permiso de descarga</span>
                                        {modal.modo === 'ver' ? (
                                            <img
                                                src={modal.usuario.tienePermisoDescarga ? CheckIcon : CrossIcon}
                                                alt={modal.usuario.tienePermisoDescarga ? 'Activo' : 'Inactivo'}
                                                style={{ width: 18, height: 18, objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div className="admin-modal__permiso-row">
                                                <label className="admin-modal__toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={permisoEdit}
                                                        onChange={e => setPermisoEdit(e.target.checked)}
                                                    />
                                                    <span className="admin-modal__toggle-track" />
                                                </label>
                                                <span className="admin-modal__toggle-label">
                                                    {permisoEdit ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="admin-modal__footer">
                                    <button className="admin-modal__btn admin-modal__btn--secundario" onClick={cerrarModal}>
                                        {modal.modo === 'ver' ? 'Cerrar' : 'Cancelar'}
                                    </button>
                                    {modal.modo === 'editar' && (
                                        <button
                                            className="admin-modal__btn admin-modal__btn--primario"
                                            onClick={handleGuardar}
                                            disabled={guardando}
                                        >
                                            {guardando ? 'Guardando…' : 'Guardar cambios'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsuariosAdmin;
