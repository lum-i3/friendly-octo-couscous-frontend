import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ChartTemperaturaHumedad from '../../components/dashboard/ChartTemperaturaHumedad';
import ChartVientoRadiacion from '../../components/dashboard/ChartVientoRadiacion';
import ChartEnergiaComparativa from '../../components/dashboard/ChartEnergiaComparativa';
import ChartPotenciaElectrica from '../../components/dashboard/ChartPotenciaElectrica';
import useTelemetriaResumen from '../../hooks/useTelemetriaResumen';
import { VISITANTE_ITEMS } from '../../utils/sidebarItems';
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

/**
 * Pantalla principal para visitantes (usuarios sin sesión).
 * Consume GET /api/telemetria/resumen (endpoint público, sin JWT).
 *
 * Rutas:
 *   - Se registrará desde App.jsx cuando se definan las rutas
 *   - Usar VISITANTE_ITEMS con defaultActiveKey="graficas"
 */
function DashboardVisitante() {
    const { datos, cargando, error } = useTelemetriaResumen();

    const clima      = datos?.ultimaLecturaClimatica;
    const solar      = datos?.ultimaLecturaFotovoltaica;
    const eolica     = datos?.ultimaLecturaEolica;
    const enLinea    = datos?.datosEnTiempoReal ?? false;
    const timestamp  = formatTimestamp(datos?.timestampConsulta);

    return (
        <div className="page-with-header">

            {/* Cabecera institucional con logos SEP / TecNM / CENIDET */}
            <Header />

            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={VISITANTE_ITEMS}
                    defaultActiveKey="graficas"
                >
                    {/* Indicador de estado de sincronización */}
                    {!cargando && (
                        <div className="dashboard-meta">
                            <span
                                className={`dashboard-meta__dot${enLinea ? '' : ' dashboard-meta__dot--offline'}`}
                            />
                            <span>
                                {enLinea ? 'Datos en tiempo real' : 'Datos sin conexión'}
                                {timestamp && ` · Actualizado: ${timestamp}`}
                            </span>
                        </div>
                    )}

                    {/* Error de carga */}
                    {error && (
                        <div className="dashboard-error">
                            <span>No se pudo cargar la telemetría.</span>
                            <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{error}</span>
                        </div>
                    )}

                    {/* Grid de tarjetas */}
                    <div className="dashboard-grid">

                        {/* Tarjeta 1 — Temperatura y Humedad */}
                        <DashboardCard
                            titulo="Temperatura y Humedad"
                            cargando={cargando}
                        >
                            <ChartTemperaturaHumedad lectura={clima} />
                        </DashboardCard>

                        {/* Tarjeta 2 — Viento y Radiación */}
                        <DashboardCard
                            titulo="Viento y Radiación Solar"
                            cargando={cargando}
                        >
                            <ChartVientoRadiacion lectura={clima} />
                        </DashboardCard>

                        {/* Tarjeta 3 — Energía Solar vs Eólica */}
                        <DashboardCard
                            titulo="Energía Generada (kWh)"
                            cargando={cargando}
                        >
                            <ChartEnergiaComparativa solar={solar} eolica={eolica} />
                        </DashboardCard>

                        {/* Tarjeta 4 (ancha) — Comparativa eléctrica */}
                        <DashboardCard
                            titulo="Comparativa Eléctrica: Solar vs Eólico"
                            wide
                            cargando={cargando}
                        >
                            <ChartPotenciaElectrica solar={solar} eolica={eolica} />
                        </DashboardCard>

                    </div>
                </SidebarLayout>
            </div>

        </div>
    );
}

export default DashboardVisitante;
