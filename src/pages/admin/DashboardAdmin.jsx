import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import DashboardCard from '../../components/dashboard/DashboardCard';
import useAdminSummary from '../../hooks/useAdminSummary';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems';
import UsuariosLogo from '../../assets/Icons/UsuariosLogo.png';
import UserIcon from '../../assets/Icons/UserIcon.png';
import SolicitudLogo from '../../assets/Icons/SolicitudLogo.png';
import '../../styles/dashboard.css';

function fmtFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

const ACCION_VARIANTE = {
    ACTIVAR: 'positivo', REACTIVAR: 'positivo', APROBAD: 'positivo',
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

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function StatAdmin({ icono, numero, label, variante }) {
    return (
        <div className={`admin-stat${variante ? ` admin-stat--${variante}` : ''}`}>
            <img src={icono} alt="" className="admin-stat__icon" />
            <span className="admin-stat__numero">{numero ?? '—'}</span>
            <span className="admin-stat__label">{label}</span>
        </div>
    );
}

function HistorialReciente({ acciones }) {
    if (!acciones?.length) {
        return <p className="admin-historial__empty">Sin acciones registradas.</p>;
    }
    return (
        <div className="admin-historial">
            <table className="admin-historial-table">
                <thead>
                    <tr>
                        <th>Acción</th>
                        <th>Usuario</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {acciones.map(a => (
                        <tr key={a.idAccion}>
                            <td>
                                <span className={`admin-historial__accion admin-historial__accion--${badgeVariante(a.tipoAccion)}`}>
                                    {a.tipoAccion ?? '—'}
                                </span>
                            </td>
                            <td className="admin-historial__usuario">{a.nombreUsuario ?? '—'}</td>
                            <td className="admin-historial__desc" title={a.descripcion}>{a.descripcion ?? '—'}</td>
                            <td className="admin-historial__fecha">{fmtFecha(a.fechaAccion)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DashboardAdmin() {
    const navigate = useNavigate();
    const { resumen, cargando } = useAdminSummary();
    const { perfil } = useUserProfile();

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto: perfil.fotoPerfil || null,
    } : null;

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
        if (isConfirmed) {
            localStorage.removeItem('jwt');
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const headerActions = (
        <button
            className="nav-action-btn nav-action-btn--danger"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={handleLogout}
        >
            <LogoutIcon />
        </button>
    );

    const atencion = (resumen?.bloqueados ?? 0) + (resumen?.sinConfirmar ?? 0);

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={ADMIN_ITEMS}
                    user={sidebarUser}
                    titulo="Dashboard"
                    actions={headerActions}
                >
                    <div className="dashboard-grid">

                        {/* ── Fila 1: Contadores de usuarios ── */}
                        <DashboardCard titulo="Total registrados" cargando={cargando}>
                            <StatAdmin
                                icono={UsuariosLogo}
                                numero={resumen?.total}
                                label="usuarios en el sistema"
                            />
                        </DashboardCard>

                        <DashboardCard titulo="Usuarios activos" cargando={cargando}>
                            <StatAdmin
                                icono={UserIcon}
                                numero={resumen?.activos}
                                label="cuentas con acceso activo"
                                variante="verde"
                            />
                        </DashboardCard>

                        <DashboardCard titulo="Requieren atención" cargando={cargando}>
                            <StatAdmin
                                icono={SolicitudLogo}
                                numero={atencion}
                                label={`${resumen?.bloqueados ?? 0} bloqueados · ${resumen?.sinConfirmar ?? 0} sin confirmar`}
                                variante={atencion > 0 ? 'naranja' : undefined}
                            />
                        </DashboardCard>

                        {/* ── Fila 2: Historial de acciones recientes ── */}
                        <DashboardCard
                            titulo="Historial de acciones recientes"
                            wide
                            cargando={cargando}
                        >
                            <HistorialReciente acciones={resumen?.historial} />
                        </DashboardCard>

                    </div>
                </SidebarLayout>
            </div>
        </div>
    );
}

export default DashboardAdmin;
