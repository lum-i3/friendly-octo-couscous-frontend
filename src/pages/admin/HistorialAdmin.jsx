import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems';
import BuscadorIcon from '../../assets/Icons/BuscadorIcon.png';
import PaginacionBack from '../../assets/Icons/PaginacionBack.png';
import PaginacionNext from '../../assets/Icons/PaginacionNext.png';
import '../../styles/dashboard.css';
import '../../styles/admin.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 30;

/* Mapeo de tipoAccion a etiqueta legible */
const TIPO_LABEL = {
    'ESTADO_USUARIO_CAMBIADO':   'Cambio de estado',
    'ADMIN_CREADO':              'Admin creado',
    'PERMISO_DESCARGA_CAMBIADO': 'Cambio de permiso',
    'SOLICITUD_RESUELTA':        'Solicitud resuelta',
};

function tipoLabel(tipo) {
    return TIPO_LABEL[tipo] ?? tipo?.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()) ?? '—';
}

/* Badge de color según tipo de acción */
const ACCION_VARIANTE = {
    ACTIVAR: 'positivo', REACTIVAR: 'positivo', APROBAD: 'positivo', ADMIN_CREADO: 'positivo',
    DESACTIVAR: 'negativo', BLOQUEAR: 'negativo', RECHAZ: 'negativo',
};

function badgeVariante(tipo) {
    if (!tipo) return 'neutro';
    const u = tipo.toUpperCase();
    for (const [k, v] of Object.entries(ACCION_VARIANTE)) {
        if (u.includes(k)) return v;
    }
    return 'neutro';
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

function HistorialAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Estado de tabla ── */
    const [acciones, setAcciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    /* ── Filtros cliente ── */
    const [busqueda, setBusqueda] = useState('');
    const [ordenFecha, setOrdenFecha] = useState('desc');       // 'asc' | 'desc'
    const [tipoFiltro, setTipoFiltro] = useState('');           // '' = todos

    /* ── Carga ── */
    const cargarHistorial = useCallback(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }
        setCargando(true);
        const qs = new URLSearchParams({ page: pagina, size: PAGE_SIZE });
        fetch(`${BASE_URL}/api/admin/historial?${qs}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                setAcciones(json?.datos?.contenido ?? []);
                setTotalPaginas(json?.datos?.totalPaginas ?? 0);
                setTotalElementos(json?.datos?.totalElementos ?? 0);
                setCargando(false);
            })
            .catch(() => setCargando(false));
    }, [pagina]);

    useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

    /* ── Tipos únicos para el selector ── */
    const tiposDisponibles = useMemo(() => {
        const set = new Set(acciones.map(a => a.tipoAccion).filter(Boolean));
        return [...set].sort();
    }, [acciones]);

    /* ── Filtro + sort cliente ── */
    const accionesFiltradas = useMemo(() => {
        let result = [...acciones];

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            result = result.filter(a =>
                (a.nombreCompleto ?? '').toLowerCase().includes(q) ||
                (a.nombreUsuario ?? '').toLowerCase().includes(q) ||
                (a.tipoAccion ?? '').toLowerCase().includes(q)
            );
        }

        if (tipoFiltro) {
            result = result.filter(a => a.tipoAccion === tipoFiltro);
        }

        result.sort((a, b) => {
            const da = new Date(a.fechaAccion).getTime();
            const db = new Date(b.fechaAccion).getTime();
            return ordenFecha === 'asc' ? da - db : db - da;
        });

        return result;
    }, [acciones, busqueda, tipoFiltro, ordenFecha]);

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

    const paginas = generarPaginas(pagina, totalPaginas);

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout navItems={ADMIN_ITEMS} user={sidebarUser} titulo="Historial de acciones" actions={headerActions}>

                    <div className="admin-tabla-container">
                        <h2 className="admin-tabla-titulo">Últimas acciones realizadas</h2>

                        {/* Filtros */}
                        <div className="admin-filtros">
                            <div className="admin-filtros__search">
                                <img src={BuscadorIcon} alt="" className="admin-filtros__search-icon" />
                                <input
                                    type="text"
                                    className="admin-filtros__search-input"
                                    placeholder="Buscar por nombre o usuario…"
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                            </div>

                            {/* Selector de tipo de acción */}
                            <select
                                className="admin-filtros__sort-btn"
                                style={{ cursor: 'pointer', paddingRight: 10 }}
                                value={tipoFiltro}
                                onChange={e => setTipoFiltro(e.target.value)}
                                title="Filtrar por tipo de acción"
                            >
                                <option value="">Todos los tipos</option>
                                {tiposDisponibles.map(t => (
                                    <option key={t} value={t}>{tipoLabel(t)}</option>
                                ))}
                            </select>

                            {/* Orden por fecha */}
                            <button
                                className={`admin-filtros__sort-btn${ordenFecha === 'asc' ? ' admin-filtros__sort-btn--activo' : ''}`}
                                onClick={() => setOrdenFecha(o => o === 'desc' ? 'asc' : 'desc')}
                                title="Ordenar por fecha"
                            >
                                {ordenFecha === 'desc' ? 'Más reciente' : 'Más antigua'}
                            </button>
                        </div>

                        {/* Tabla */}
                        <div className="admin-tabla-wrapper">
                            <table className="admin-tabla">
                                <thead>
                                    <tr>
                                        <th>Nombre completo</th>
                                        <th>Nombre de usuario</th>
                                        <th>Fecha de la acción</th>
                                        <th>Acción</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i} className="admin-tabla__skeleton">
                                                <td>████████████</td>
                                                <td>████████</td>
                                                <td>██████████</td>
                                                <td>██████████</td>
                                                <td>████████████████████</td>
                                            </tr>
                                        ))
                                    ) : accionesFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="admin-tabla__empty">
                                                {busqueda || tipoFiltro ? 'No se encontraron acciones con ese criterio.' : 'No hay acciones registradas.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        accionesFiltradas.map(a => (
                                            <tr key={a.idAccion}>
                                                <td>
                                                    <div className="admin-tabla__nombre">{a.nombreCompleto || '—'}</div>
                                                </td>
                                                <td>@{a.nombreUsuario}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{fmtFechaHora(a.fechaAccion)}</td>
                                                <td>
                                                    <span className={`admin-historial__accion admin-historial__accion--${badgeVariante(a.tipoAccion)}`}>
                                                        {tipoLabel(a.tipoAccion)}
                                                    </span>
                                                </td>
                                                <td
                                                    className="admin-historial__desc"
                                                    title={a.descripcion ?? ''}
                                                    style={{ maxWidth: 260 }}
                                                >
                                                    {a.descripcion || '—'}
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
                                    Página {pagina + 1} de {totalPaginas} · {totalElementos} acciones
                                </p>
                            </>
                        )}
                    </div>

                </SidebarLayout>
            </div>
        </div>
    );
}

export default HistorialAdmin;
