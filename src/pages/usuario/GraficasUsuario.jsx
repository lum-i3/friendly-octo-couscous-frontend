import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import GraficaLineaTemperatura from '../../components/graficas/GraficaLineaTemperatura';
import GraficaLineaHumedadViento from '../../components/graficas/GraficaLineaHumedadViento';
import GraficaLineaElectrico from '../../components/graficas/GraficaLineaElectrico';
import FiltroFechasGrafica from '../../components/graficas/FiltroFechasGrafica';
import useHistoricoClimatica from '../../hooks/useHistoricoClimatica';
import useHistoricoElectrica from '../../hooks/useHistoricoElectrica';
import useUserProfile from '../../hooks/useUserProfile';
import { downsample } from '../../utils/downsample';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import '../../styles/dashboard.css';
import '../../styles/graficas.css';

const OPCIONES_INTERVALO = [
    { min: 1,  label: '1 min' },
    { min: 2,  label: '2 min' },
    { min: 5,  label: '5 min' },
    { min: 10, label: '10 min' },
    { min: 15, label: '15 min' },
    { min: 30, label: '30 min' },
    { min: 60, label: '1 hora' },
];

function isoAhora() {
    return new Date().toISOString().slice(0, 19);
}
function isoHace(diasAtras) {
    const d = new Date();
    d.setDate(d.getDate() - diasAtras);
    return d.toISOString().slice(0, 19);
}
function filtroDefault() {
    return { inicioISO: isoHace(1), finISO: isoAhora() };
}

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ExpandIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 5V2h3M10 2h3v3M13 10v3h-3M5 13H2v-3"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CollapseIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M5 2v3H2M10 2v3h3M10 13v-3h3M5 13v-3H2"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function ChartCard({ id, titulo, cargando, error, onExpand, children }) {
    return (
        <div className="graficas-chart-card">
            <div className="graficas-chart-card__header">
                <h3 className="graficas-chart-card__titulo">{titulo}</h3>
                <button
                    type="button"
                    className="graficas-expand-btn"
                    aria-label="Ver en pantalla completa"
                    title="Pantalla completa"
                    onClick={() => onExpand(id)}
                >
                    <ExpandIcon />
                </button>
            </div>
            <div className="graficas-chart-card__body">
                {cargando
                    ? <div className="graficas-skeleton" />
                    : error
                        ? <p className="graficas-error-msg">No se pudieron cargar los datos.</p>
                        : children
                }
            </div>
        </div>
    );
}

/* Fullscreen overlay for a single chart */
function ChartFullscreen({ titulo, onClose, children }) {
    return (
        <div className="chart-fullscreen-overlay" role="dialog" aria-modal="true">
            <div className="chart-fullscreen-inner">
                <div className="chart-fullscreen-header">
                    <h2 className="chart-fullscreen-titulo">{titulo}</h2>
                    <button type="button" className="chart-fullscreen-close" onClick={onClose} aria-label="Cerrar">
                        <CollapseIcon />
                        <span>Cerrar</span>
                    </button>
                </div>
                <div className="chart-fullscreen-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

function GraficasUsuario() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Intervalo de muestreo ─────────────────────────── */
    const [intervaloMin, setIntervaloMin] = useState(() => {
        const saved = sessionStorage.getItem('gu-intervalo');
        return saved !== null ? Number(saved) : 1;
    });

    function handleIntervalo(min) {
        setIntervaloMin(min);
        sessionStorage.setItem('gu-intervalo', String(min));
    }

    /* ── Rango de fechas ───────────────────────────────── */
    const [rango, setRango] = useState(filtroDefault);

    function handleRango(inicioISO, finISO) {
        setRango({ inicioISO, finISO });
    }

    function navegarAnterior() {
        const durMs = new Date(rango.finISO) - new Date(rango.inicioISO);
        const newFin   = new Date(rango.inicioISO);
        const newInicio = new Date(newFin.getTime() - durMs);
        setRango({
            inicioISO: newInicio.toISOString().slice(0, 19),
            finISO:    newFin.toISOString().slice(0, 19),
        });
    }

    function navegarSiguiente() {
        const durMs = new Date(rango.finISO) - new Date(rango.inicioISO);
        const newInicio = new Date(rango.finISO);
        const rawFin    = newInicio.getTime() + durMs;
        const newFin    = new Date(Math.min(rawFin, Date.now()));
        setRango({
            inicioISO: newInicio.toISOString().slice(0, 19),
            finISO:    newFin.toISOString().slice(0, 19),
        });
    }

    const enPresente = new Date(rango.finISO) >= new Date(Date.now() - 60000);

    /* ── Fullscreen ────────────────────────────────────── */
    const [fullscreen, setFullscreen] = useState(null); // null | 'clima' | 'humViento' | 'solar' | 'eolica'

    /* ── Fetch ─────────────────────────────────────────── */
    const { lecturas: lectClima,  cargando: cargandoClima,  error: errClima  } = useHistoricoClimatica(rango.inicioISO, rango.finISO, 600);
    const { lecturas: lectSolar,  cargando: cargandoSolar,  error: errSolar  } = useHistoricoElectrica('FOTOVOLTAICO', rango.inicioISO, rango.finISO, 600);
    const { lecturas: lectEolica, cargando: cargandoEolica, error: errEolica } = useHistoricoElectrica('EOLICO',       rango.inicioISO, rango.finISO, 600);

    /* ── Downsampling ──────────────────────────────────── */
    const lcClima  = useMemo(() => downsample(lectClima,  intervaloMin), [lectClima,  intervaloMin]);
    const lcSolar  = useMemo(() => downsample(lectSolar,  intervaloMin), [lectSolar,  intervaloMin]);
    const lcEolica = useMemo(() => downsample(lectEolica, intervaloMin), [lectEolica, intervaloMin]);

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    const handleLogout = useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Cerrar sesión?', icon: 'question', showCancelButton: true,
            confirmButtonText: 'Cerrar sesión', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#E94E50', cancelButtonColor: '#176682',
        });
        if (isConfirmed) { localStorage.removeItem('jwt'); navigate('/login', { replace: true }); }
    }, [navigate]);

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    const charts = [
        {
            id: 'clima',
            titulo: 'Temperatura (°C)',
            cargando: cargandoClima,
            error: errClima,
            content: <GraficaLineaTemperatura lecturas={lcClima} />,
        },
        {
            id: 'humViento',
            titulo: 'Humedad y Viento',
            cargando: cargandoClima,
            error: errClima,
            content: <GraficaLineaHumedadViento lecturas={lcClima} />,
        },
        {
            id: 'solar',
            titulo: 'Sistema Fotovoltaico',
            cargando: cargandoSolar,
            error: errSolar,
            content: <GraficaLineaElectrico lecturas={lcSolar} color="#F5A623" colorFondo="rgba(245,166,35,0.13)" label="Potencia Solar (W)" />,
        },
        {
            id: 'eolica',
            titulo: 'Sistema Eólico',
            cargando: cargandoEolica,
            error: errEolica,
            content: <GraficaLineaElectrico lecturas={lcEolica} color="#4ECDC4" colorFondo="rgba(78,205,196,0.13)" label="Potencia Eólica (W)" />,
        },
    ];

    const chartFullscreenData = fullscreen ? charts.find(c => c.id === fullscreen) : null;

    return (
        <div className="page-with-header graficas-page-wrapper graficas-page-wrapper--usuario">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Gráficas"
                    onBack={() => navigate(-1)}
                    onHome={() => navigate('/')}
                    actions={headerActions}
                >
                    <div className="graficas-page">

                        {/* ── Barra de controles ── */}
                        <div className="graficas-controls-bar">

                            {/* Selector de intervalo de muestreo */}
                            <div className="graficas-interval-row">
                                <span className="graficas-interval-label">Intervalo:</span>
                                {OPCIONES_INTERVALO.map(({ min, label }) => (
                                    <button
                                        key={min}
                                        type="button"
                                        className={`graficas-interval-chip${intervaloMin === min ? ' graficas-interval-chip--activo' : ''}`}
                                        onClick={() => handleIntervalo(min)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Navegación temporal */}
                            <div className="graficas-nav-row">
                                <button
                                    type="button"
                                    className="graficas-nav-btn"
                                    onClick={navegarAnterior}
                                    title="Período anterior"
                                    aria-label="Período anterior"
                                >
                                    ‹ Anterior
                                </button>

                                <FiltroFechasGrafica
                                    inicioISO={rango.inicioISO}
                                    finISO={rango.finISO}
                                    onChange={handleRango}
                                />

                                <button
                                    type="button"
                                    className={`graficas-nav-btn${enPresente ? ' graficas-nav-btn--disabled' : ''}`}
                                    onClick={enPresente ? undefined : navegarSiguiente}
                                    disabled={enPresente}
                                    title="Período siguiente"
                                    aria-label="Período siguiente"
                                >
                                    Siguiente ›
                                </button>
                            </div>
                        </div>

                        {/* ── Gráficas ── */}
                        <div className="graficas-layout">
                            {charts.map(ch => (
                                <ChartCard key={ch.id} {...ch} onExpand={setFullscreen}>
                                    {ch.content}
                                </ChartCard>
                            ))}
                        </div>

                    </div>
                </SidebarLayout>
            </div>

            {/* ── Fullscreen overlay ── */}
            {chartFullscreenData && (
                <ChartFullscreen
                    titulo={chartFullscreenData.titulo}
                    onClose={() => setFullscreen(null)}
                >
                    {chartFullscreenData.cargando
                        ? <div className="graficas-skeleton" />
                        : chartFullscreenData.error
                            ? <p className="graficas-error-msg">No se pudieron cargar los datos.</p>
                            : chartFullscreenData.content
                    }
                </ChartFullscreen>
            )}
        </div>
    );
}

export default GraficasUsuario;
