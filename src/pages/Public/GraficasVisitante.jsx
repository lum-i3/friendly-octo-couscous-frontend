import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import GraficaTemperatura from '../../components/graficas/GraficaTemperatura';
import GraficaVientoRadiacion from '../../components/graficas/GraficaVientoRadiacion';
import useTelemetriaResumen from '../../hooks/useTelemetriaResumen';
import { VISITANTE_ITEMS } from '../../utils/sidebarItems';
import '../../styles/dashboard.css';
import '../../styles/graficas.css';

const INTERVALOS = [
    { value: 60,  label: '1 min' },
    { value: 300, label: '5 min' },
];

function tiempoDesde(fecha) {
    if (!fecha) return null;
    const seg = Math.floor((Date.now() - fecha.getTime()) / 1000);
    if (seg < 60) return `hace ${seg}s`;
    return `hace ${Math.floor(seg / 60)}min`;
}

function GraficasVisitante({ onBack, onHome }) {
    const [intervaloSeg, setIntervaloSeg] = useState(() => {
        const saved = sessionStorage.getItem('gv-intervalo');
        return saved !== null ? Number(saved) : 60;
    });

    function handleIntervalo(seg) {
        setIntervaloSeg(seg);
        sessionStorage.setItem('gv-intervalo', String(seg));
    }
    const { datos, cargando, error, ultimaActualizacion } = useTelemetriaResumen(intervaloSeg * 1000);

    // Contador de segundos para refrescar el texto "hace Xs"
    const [, setAhora] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setAhora(n => n + 1), 5000);
        return () => clearInterval(id);
    }, []);

    const clima = datos?.ultimaLecturaClimatica;

    return (
        <div className="page-with-header graficas-page-wrapper">
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

                        {/* Chips descriptivos + selector de intervalo */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div className="graficas-labels-row" style={{ justifyContent: 'flex-start' }}>
                                <span className="graficas-label-chip">Temperatura y condiciones</span>
                                <span className="graficas-label-chip">Viento, radiación y presión</span>
                            </div>

                            <div className="graficas-interval-row">
                                <span className="graficas-interval-label">Actualizar:</span>
                                {INTERVALOS.map(op => (
                                    <button
                                        key={op.value}
                                        type="button"
                                        className={`graficas-interval-chip${intervaloSeg === op.value ? ' graficas-interval-chip--activo' : ''}`}
                                        onClick={() => handleIntervalo(op.value)}
                                    >
                                        {op.label}
                                    </button>
                                ))}
                                {ultimaActualizacion && (
                                    <span className="graficas-interval-ts">
                                        Actualizado {tiempoDesde(ultimaActualizacion)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {error && !cargando && (
                            <div className="dashboard-error">
                                <span>No se pudo cargar la telemetría.</span>
                                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{error}</span>
                            </div>
                        )}

                        <div className="graficas-layout">
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
