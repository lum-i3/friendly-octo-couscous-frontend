import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import GraficaLineaTemperatura from '../../components/graficas/GraficaLineaTemperatura';
import GraficaLineaHumedadViento from '../../components/graficas/GraficaLineaHumedadViento';
import GraficaLineaElectrico from '../../components/graficas/GraficaLineaElectrico';
import useHistoricoClimatica from '../../hooks/useHistoricoClimatica';
import useHistoricoElectrica from '../../hooks/useHistoricoElectrica';
import useUserProfile from '../../hooks/useUserProfile';
import { downsample } from '../../utils/downsample';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import '../../styles/dashboard.css';
import '../../styles/graficas.css';

/*
 * Configuración de intervalo:
 * - dias/size compartidos entre intervalos adyacentes para evitar refetches
 *   cuando el usuario cambia entre 1↔2 min, 5↔10 min, 15↔30 min (mismos parámetros → sin re-fetch)
 * - Con dias=1 y size=600: gap real ~2.4 min → muestra máxima resolución disponible en 24h
 * - Con dias=7 y size=600: gap real ~16.8 min → 30 min reduce a ~336 pts, 15 min a ~600
 * - Con dias=14 y size=600: gap real ~33.6 min → 60 min bucket reduce a ~336 pts
 */
const INTERVALO_CONFIG = {
    1:  { label: '1 min',  dias: 1,  size: 600, diasLabel: 'últimas 24 horas' },
    2:  { label: '2 min',  dias: 1,  size: 600, diasLabel: 'últimas 24 horas' },
    5:  { label: '5 min',  dias: 3,  size: 600, diasLabel: 'últimos 3 días' },
    10: { label: '10 min', dias: 3,  size: 600, diasLabel: 'últimos 3 días' },
    15: { label: '15 min', dias: 7,  size: 600, diasLabel: 'últimos 7 días' },
    30: { label: '30 min', dias: 7,  size: 600, diasLabel: 'últimos 7 días' },
    60: { label: '1 hora', dias: 14, size: 600, diasLabel: 'últimos 14 días' },
};

const OPCIONES_INTERVALO = [1, 2, 5, 10, 15, 30, 60];

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function GraficasUsuario() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();
    const [intervaloMin, setIntervaloMin] = useState(1);

    const cfg = INTERVALO_CONFIG[intervaloMin];

    /* Fetch — sólo se dispara cuando dias o size cambian (no en cada cambio de intervaloMin) */
    const { lecturas: lectClima,  cargando: cargandoClima  } = useHistoricoClimatica(cfg.dias, cfg.size);
    const { lecturas: lectSolar,  cargando: cargandoSolar  } = useHistoricoElectrica('FOTOVOLTAICO', cfg.dias, cfg.size);
    const { lecturas: lectEolica, cargando: cargandoEolica } = useHistoricoElectrica('EOLICO',       cfg.dias, cfg.size);

    /* Downsampling client-side — instantáneo cuando sólo cambia intervaloMin */
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

                        {/* Chips descriptivos */}
                        <div className="graficas-labels-row">
                            <span className="graficas-label-chip">Temperatura</span>
                            <span className="graficas-label-chip">Humedad y viento</span>
                            <span className="graficas-label-chip">Energía solar</span>
                            <span className="graficas-label-chip">Energía eólica</span>
                        </div>

                        {/* Selector de intervalo */}
                        <div className="graficas-interval-row">
                            <span className="graficas-interval-label">Intervalo:</span>
                            {OPCIONES_INTERVALO.map(min => (
                                <button
                                    key={min}
                                    type="button"
                                    className={`graficas-interval-chip${intervaloMin === min ? ' graficas-interval-chip--activo' : ''}`}
                                    onClick={() => setIntervaloMin(min)}
                                >
                                    {INTERVALO_CONFIG[min].label}
                                </button>
                            ))}
                        </div>

                        <div className="graficas-layout">

                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Temperatura — {cfg.diasLabel} (°C)
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoClima
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaTemperatura lecturas={lcClima} />
                                    }
                                </div>
                            </div>

                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Humedad y viento — {cfg.diasLabel}
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoClima
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaHumedadViento lecturas={lcClima} />
                                    }
                                </div>
                            </div>

                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Sistema fotovoltaico — {cfg.diasLabel}
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoSolar
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaElectrico
                                            lecturas={lcSolar}
                                            color="#F5A623"
                                            colorFondo="rgba(245,166,35,0.13)"
                                            label="Potencia Solar (W)"
                                        />
                                    }
                                </div>
                            </div>

                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Sistema eólico — {cfg.diasLabel}
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoEolica
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaElectrico
                                            lecturas={lcEolica}
                                            color="#4ECDC4"
                                            colorFondo="rgba(78,205,196,0.13)"
                                            label="Potencia Eólica (W)"
                                        />
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

export default GraficasUsuario;
