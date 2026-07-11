import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems';
import OjoAbierto from '../../assets/Icons/OjoAbierto.png';
import CheckIcon from '../../assets/Icons/CheckIcon.png';
import CrossIcon from '../../assets/Icons/CrossIcon.png';
import BuscadorIcon from '../../assets/Icons/BuscadorIcon.png';
import PaginacionBack from '../../assets/Icons/PaginacionBack.png';
import PaginacionNext from '../../assets/Icons/PaginacionNext.png';
import '../../styles/dashboard.css';
import '../../styles/admin.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 20;

const ESTADO_SOLICITUD_LABEL = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
};

function badgeClaseSolicitud(estado) {
    return `admin-badge admin-badge--${(estado ?? '').toLowerCase()}`;
}

function fmtFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtFechaHora(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
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

function SolicitudesAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Estado de tabla ── */
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    /* ── Filtros cliente ── */
    const [busqueda, setBusqueda] = useState('');
    const [ordenNombre, setOrdenNombre] = useState(null);   // null | 'asc' | 'desc'
    const [ordenFecha, setOrdenFecha] = useState('desc');   // 'asc' | 'desc'

    /* ── Modal ── */
    const [modal, setModal] = useState(null);   // null | DownloadRequestDetailDTO
    const [procesando, setProcesando] = useState(false);

    /* ── Carga ── */
    const cargarSolicitudes = useCallback(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }
        setCargando(true);
        const qs = new URLSearchParams({ page: pagina, size: PAGE_SIZE });
        fetch(`${BASE_URL}/api/solicitudes?${qs}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                setSolicitudes(json?.datos?.contenido ?? []);
                setTotalPaginas(json?.datos?.totalPaginas ?? 0);
                setTotalElementos(json?.datos?.totalElementos ?? 0);
                setCargando(false);
            })
            .catch(() => setCargando(false));
    }, [pagina]);

    useEffect(() => { cargarSolicitudes(); }, [cargarSolicitudes]);

    /* ── Filtro + sort cliente ── */
    const solicitudesFiltradas = useMemo(() => {
        let result = [...solicitudes];
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            result = result.filter(s =>
                (s.nombreCompleto ?? '').toLowerCase().includes(q) ||
                (s.nombreUsuario ?? '').toLowerCase().includes(q) ||
                (s.correo ?? '').toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            if (ordenNombre) {
                const cmp = (a.nombreCompleto ?? '').localeCompare(b.nombreCompleto ?? '', 'es');
                return ordenNombre === 'asc' ? cmp : -cmp;
            }
            const da = new Date(a.fechaSolicitud).getTime();
            const db = new Date(b.fechaSolicitud).getTime();
            return ordenFecha === 'asc' ? da - db : db - da;
        });
        return result;
    }, [solicitudes, busqueda, ordenNombre, ordenFecha]);

    /* ── Resolver solicitud ── */
    const handleResolver = useCallback(async (solicitud, desicion) => {
        const esAprobar = desicion === 'APROBADA';
        const { isConfirmed } = await Swal.fire({
            title: esAprobar ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?',
            html: `La solicitud de <strong>${solicitud.nombreCompleto ?? solicitud.nombreUsuario}</strong> será <strong>${esAprobar ? 'aprobada' : 'rechazada'}</strong>.`,
            icon: esAprobar ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: esAprobar ? 'Aprobar' : 'Rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: esAprobar ? '#1a7a41' : '#c0392b',
            cancelButtonColor: '#6b7a80',
        });
        if (!isConfirmed) return;

        setProcesando(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/solicitudes/resolver`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ idSolicitudDescarga: solicitud.idSolicitudDescarga, desicion }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al procesar la solicitud');
            await Swal.fire({
                icon: 'success',
                title: esAprobar ? 'Solicitud aprobada' : 'Solicitud rechazada',
                text: esAprobar ? 'El usuario ahora tiene permiso de descarga.' : 'La solicitud fue rechazada.',
                timer: 2000,
                showConfirmButton: false,
            });
            setModal(null);
            cargarSolicitudes();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        } finally {
            setProcesando(false);
        }
    }, [cargarSolicitudes]);

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
    const sidebarUser = perfil
        ? { nombre: perfil.nombreCompleto || perfil.nombreUsuario, foto: perfil.fotoPerfil || null }
        : null;

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    /* ── Paginación ── */
    const paginas = generarPaginas(pagina, totalPaginas);

    /* ── Toggle helpers ── */
    const toggleNombre = () => {
        setOrdenNombre(prev => {
            if (prev === null) return 'asc';
            if (prev === 'asc') return 'desc';
            return null;
        });
    };

    const toggleFecha = () => {
        setOrdenFecha(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const nombreBtnLabel = ordenNombre === null ? 'Nombre A–Z' : ordenNombre === 'asc' ? 'Nombre A→Z' : 'Nombre Z→A';
    const fechaBtnLabel  = ordenFecha === 'desc' ? 'Más reciente' : 'Más antigua';

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout navItems={ADMIN_ITEMS} user={sidebarUser} titulo="Solicitudes de descarga" actions={headerActions}>

                    <div className="admin-tabla-container">
                        <h2 className="admin-tabla-titulo">Últimas solicitudes</h2>

                        {/* Filtros */}
                        <div className="admin-filtros">
                            <div className="admin-filtros__search">
                                <img src={BuscadorIcon} alt="" className="admin-filtros__search-icon" />
                                <input
                                    type="text"
                                    className="admin-filtros__search-input"
                                    placeholder="Buscar por nombre, usuario o correo…"
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                            </div>
                            <button
                                className={`admin-filtros__sort-btn${ordenNombre ? ' admin-filtros__sort-btn--activo' : ''}`}
                                onClick={toggleNombre}
                                title="Ordenar por nombre"
                            >
                                {nombreBtnLabel}
                            </button>
                            <button
                                className={`admin-filtros__sort-btn${ordenFecha === 'asc' ? ' admin-filtros__sort-btn--activo' : ''}`}
                                onClick={toggleFecha}
                                title="Ordenar por fecha"
                            >
                                {fechaBtnLabel}
                            </button>
                        </div>

                        {/* Tabla */}
                        <div className="admin-tabla-wrapper">
                            <table className="admin-tabla">
                                <thead>
                                    <tr>
                                        <th>Nombre completo</th>
                                        <th>Nombre de usuario</th>
                                        <th>Fecha de la solicitud</th>
                                        <th>Estado</th>
                                        <th style={{ textAlign: 'center' }}>Ver solicitud</th>
                                        <th style={{ textAlign: 'center' }}>Aceptar / Rechazar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i} className="admin-tabla__skeleton">
                                                <td>████████████</td>
                                                <td>████████</td>
                                                <td>██████████</td>
                                                <td>████████</td>
                                                <td style={{ textAlign: 'center' }}>●</td>
                                                <td style={{ textAlign: 'center' }}>● ●</td>
                                            </tr>
                                        ))
                                    ) : solicitudesFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="admin-tabla__empty">
                                                {busqueda ? 'No se encontraron solicitudes con ese criterio.' : 'No hay solicitudes registradas.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        solicitudesFiltradas.map(s => (
                                            <tr key={s.idSolicitudDescarga}>
                                                <td>
                                                    <div className="admin-tabla__nombre">{s.nombreCompleto || '—'}</div>
                                                </td>
                                                <td>@{s.nombreUsuario}</td>
                                                <td>{fmtFecha(s.fechaSolicitud)}</td>
                                                <td>
                                                    <span className={badgeClaseSolicitud(s.estado)}>
                                                        {ESTADO_SOLICITUD_LABEL[s.estado] ?? s.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="admin-acciones" style={{ justifyContent: 'center' }}>
                                                        <button
                                                            className="admin-accion-btn"
                                                            title="Ver detalle de la solicitud"
                                                            onClick={() => setModal(s)}
                                                        >
                                                            <img src={OjoAbierto} alt="Ver" className="admin-accion-btn__icon" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="admin-acciones" style={{ justifyContent: 'center' }}>
                                                        {s.estado === 'PENDIENTE' ? (
                                                            <>
                                                                <button
                                                                    className="admin-accion-btn admin-accion-btn--aprobar"
                                                                    title="Aprobar solicitud"
                                                                    onClick={() => handleResolver(s, 'APROBADA')}
                                                                    disabled={procesando}
                                                                >
                                                                    <img src={CheckIcon} alt="Aprobar" className="admin-accion-btn__icon" />
                                                                </button>
                                                                <button
                                                                    className="admin-accion-btn admin-accion-btn--rechazar"
                                                                    title="Rechazar solicitud"
                                                                    onClick={() => handleResolver(s, 'RECHAZADA')}
                                                                    disabled={procesando}
                                                                >
                                                                    <img src={CrossIcon} alt="Rechazar" className="admin-accion-btn__icon" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: '0.76rem', color: '#6b7a80', fontFamily: 'Inter, system-ui, sans-serif' }}>
                                                                Resuelta
                                                            </span>
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
                                    Página {pagina + 1} de {totalPaginas} · {totalElementos} solicitudes
                                </p>
                            </>
                        )}
                    </div>

                </SidebarLayout>
            </div>

            {/* ── Modal de detalle de solicitud ── */}
            {modal !== null && (
                <div
                    className="admin-modal-overlay"
                    onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
                >
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__titulo">Detalle de solicitud</h3>
                            <button className="admin-modal__close" onClick={() => setModal(null)}>×</button>
                        </div>

                        {/* Solicitante */}
                        <div className="admin-modal__perfil" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                            <p className="admin-modal__nombre-completo" style={{ margin: 0 }}>{modal.nombreCompleto || '—'}</p>
                            <p className="admin-modal__username" style={{ margin: 0 }}>@{modal.nombreUsuario} · {modal.correo}</p>
                        </div>

                        {/* Campos */}
                        <div className="admin-modal__campos">
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Estado</span>
                                <span className={badgeClaseSolicitud(modal.estado)}>
                                    {ESTADO_SOLICITUD_LABEL[modal.estado] ?? modal.estado}
                                </span>
                            </div>
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Fecha de solicitud</span>
                                <span className="admin-modal__campo-valor">{fmtFechaHora(modal.fechaSolicitud)}</span>
                            </div>
                            <div className="admin-modal__campo">
                                <span className="admin-modal__campo-label">Permiso actual</span>
                                <span className="admin-modal__campo-valor">
                                    {modal.estadoPermiso === 'ACTIVO' ? 'Activo' : modal.estadoPermiso === 'INACTIVO' ? 'Inactivo' : 'Sin permiso'}
                                </span>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div className="admin-modal__motivo-wrap" style={{ paddingBottom: 4 }}>
                            <span className="admin-modal__motivo-label">Motivo de la solicitud</span>
                            <div style={{
                                padding: '10px 12px',
                                background: 'rgba(216, 231, 233, 0.3)',
                                borderRadius: 8,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                fontSize: '0.84rem',
                                color: '#10475C',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}>
                                {modal.motivo || '—'}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="admin-modal__footer">
                            <button
                                className="admin-modal__btn admin-modal__btn--secundario"
                                onClick={() => setModal(null)}
                            >
                                Cerrar
                            </button>
                            {modal.estado === 'PENDIENTE' && (
                                <>
                                    <button
                                        className="admin-modal__btn"
                                        style={{ background: '#c0392b', color: '#fff', flex: 1 }}
                                        disabled={procesando}
                                        onClick={() => handleResolver(modal, 'RECHAZADA')}
                                    >
                                        {procesando ? '…' : 'Rechazar'}
                                    </button>
                                    <button
                                        className="admin-modal__btn"
                                        style={{ background: '#1a7a41', color: '#fff', flex: 1 }}
                                        disabled={procesando}
                                        onClick={() => handleResolver(modal, 'APROBADA')}
                                    >
                                        {procesando ? '…' : 'Aprobar'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SolicitudesAdmin;
