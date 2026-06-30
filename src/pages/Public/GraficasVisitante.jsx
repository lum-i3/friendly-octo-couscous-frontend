import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import GraficaTemperatura from '../../components/graficas/GraficaTemperatura';
import GraficaVientoRadiacion from '../../components/graficas/GraficaVientoRadiacion';
import useTelemetriaResumen from '../../hooks/useTelemetriaResumen';
import { VISITANTE_ITEMS } from '../../utils/sidebarItems';
import '../../styles/dashboard.css';  // page-with-header
import '../../styles/graficas.css';

/**
 * Pantalla de gráficas para usuarios visitantes (sin sesión).
 * Consume GET /api/telemetria/resumen (endpoint público, sin JWT).
 *
 * Rutas:
 *   - Registrar desde App.jsx cuando se definan las rutas.
 *   - onBack / onHome deben recibir las funciones de navegación del router.
 */
function GraficasVisitante({ onBack, onHome }) {
    const { datos, cargando, error } = useTelemetriaResumen();

    // datos.ultimaLecturaClimatica → ClimateReadingDTO
    const clima = datos?.ultimaLecturaClimatica;

    return (
        <div className="page-with-header graficas-page-wrapper">

            {/* Cabecera institucional con logos SEP / TecNM / CENIDET */}
            <Header />

            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={VISITANTE_ITEMS}
                    defaultActiveKey="graficas"
                    titulo="Gráficas"
                    onBack={onBack}
                    onHome={onHome}
                >
                    <div className="graficas-page">

                        {/* Chips descriptivos — uno por gráfica */}
                        <div className="graficas-labels-row">
                            <span className="graficas-label-chip">
                                Temperatura y condiciones
                            </span>
                            <span className="graficas-label-chip">
                                Viento, radiación y presión
                            </span>
                        </div>

                        {/* Error de carga */}
                        {error && !cargando && (
                            <div className="dashboard-error">
                                <span>No se pudo cargar la telemetría.</span>
                                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{error}</span>
                            </div>
                        )}

                        {/* Layout de las dos gráficas */}
                        <div className="graficas-layout">

                            {/* Gráfica 1 — Temperatura y datos climáticos */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Temperatura y condiciones climáticas
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargando
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaTemperatura lectura={clima} />
                                    }
                                </div>
                            </div>

                            {/* Gráfica 2 — Viento, Radiación y Presión */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Viento, radiación solar y presión atmosférica
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargando
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaVientoRadiacion lectura={clima} />
                                    }
                                </div>
                            </div>

                        </div>
                    </div>
                </SidebarLayout>
            </div>

        </div>
    );
}

export default GraficasVisitante;
