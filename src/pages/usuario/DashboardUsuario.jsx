import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ChartTemperaturaHumedad from '../../components/dashboard/ChartTemperaturaHumedad';
import ChartVientoRadiacion from '../../components/dashboard/ChartVientoRadiacion';
import ChartEnergiaComparativa from '../../components/dashboard/ChartEnergiaComparativa';
import ChartStatsClimaticas from '../../components/dashboard/ChartStatsClimaticas';
import ChartEnergiaHibrida from '../../components/dashboard/ChartEnergiaHibrida';
import useTelemetriaResumen from '../../hooks/useTelemetriaResumen';
import useUserProfile from '../../hooks/useUserProfile';
import useEstadisticasClimaticas from '../../hooks/useEstadisticasClimaticas';
import useEstadisticasCombinadas from '../../hooks/useEstadisticasCombinadas';
import { USUARIO_ITEMS } from '../../utils/sidebarItems';
import '../../styles/dashboard.css';

function formatTimestamp(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DIAS_STATS = 28;

function DashboardUsuario() {
    const navigate = useNavigate();
    const { datos, cargando: cargandoResumen, error: errorResumen } = useTelemetriaResumen();
    const { perfil } = useUserProfile();
    const { stats: statsClima,      cargando: cargandoClima      } = useEstadisticasClimaticas(DIAS_STATS);
    const { stats: statsCombinadas, cargando: cargandoCombinadas } = useEstadisticasCombinadas(DIAS_STATS);

    const clima    = datos?.ultimaLecturaClimatica;
    const solar    = datos?.ultimaLecturaFotovoltaica;
    const eolica   = datos?.ultimaLecturaEolica;
    const enLinea  = datos?.datosEnTiempoReal ?? false;
    const timestamp = formatTimestamp(datos?.timestampConsulta);

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
        <button className="nav-action-btn nav-action-btn--danger" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Dashboard"
                    actions={headerActions}
                >
                    {/* Estado de sincronización */}
                    {!cargandoResumen && (
                        <div className="dashboard-meta">
                            <span className={`dashboard-meta__dot${enLinea ? '' : ' dashboard-meta__dot--offline'}`} />
                            <span>
                                {enLinea ? 'Datos en tiempo real' : 'Datos sin conexión'}
                                {timestamp && ` · Actualizado: ${timestamp}`}
                            </span>
                        </div>
                    )}

                    {errorResumen && (
                        <div className="dashboard-error">
                            <span>No se pudo cargar la telemetría.</span>
                            <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{errorResumen}</span>
                        </div>
                    )}

                    <div className="dashboard-grid">

                        {/* ── Fila 1: Tiempo real ── */}
                        <DashboardCard titulo="Temperatura y Humedad" cargando={cargandoResumen}>
                            <ChartTemperaturaHumedad lectura={clima} />
                        </DashboardCard>

                        <DashboardCard titulo="Viento y Radiación Solar" cargando={cargandoResumen}>
                            <ChartVientoRadiacion lectura={clima} />
                        </DashboardCard>

                        <DashboardCard titulo="Energía Generada (kWh)" cargando={cargandoResumen}>
                            <ChartEnergiaComparativa solar={solar} eolica={eolica} />
                        </DashboardCard>

                        {/* ── Fila 2: Estadísticas climáticas (ancha) ── */}
                        <DashboardCard
                            titulo="Estadísticas Climáticas · Últimas 4 semanas"
                            wide
                            cargando={cargandoClima}
                        >
                            <ChartStatsClimaticas stats={statsClima} />
                        </DashboardCard>

                        {/* ── Fila 3: Sistema híbrido (ancha) ── */}
                        <DashboardCard
                            titulo="Sistema Híbrido · Energía por Fuente · Últimas 4 semanas"
                            wide
                            cargando={cargandoCombinadas}
                        >
                            <ChartEnergiaHibrida stats={statsCombinadas} />
                        </DashboardCard>

                    </div>
                </SidebarLayout>
            </div>
        </div>
    );
}

export default DashboardUsuario;
