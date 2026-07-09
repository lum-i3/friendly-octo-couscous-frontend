import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import GraficaLineaTemperatura from '../../components/graficas/GraficaLineaTemperatura';
import GraficaLineaHumedadViento from '../../components/graficas/GraficaLineaHumedadViento';
import GraficaLineaElectrico from '../../components/graficas/GraficaLineaElectrico';
import useHistoricoClimatica from '../../hooks/useHistoricoClimatica';
import useHistoricoElectrica from '../../hooks/useHistoricoElectrica';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import '../../styles/dashboard.css';
import '../../styles/graficas.css';

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DIAS = 7;

function GraficasUsuario() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    const { lecturas: lectClima,   cargando: cargandoClima   } = useHistoricoClimatica(DIAS);
    const { lecturas: lectSolar,   cargando: cargandoSolar   } = useHistoricoElectrica('FOTOVOLTAICO', DIAS);
    const { lecturas: lectEolica,  cargando: cargandoEolica  } = useHistoricoElectrica('EOLICO', DIAS);

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

                        <div className="graficas-layout">

                            {/* Gráfica 1 — Temperatura histórica */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Temperatura — últimos 7 días (°C)
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoClima
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaTemperatura lecturas={lectClima} />
                                    }
                                </div>
                            </div>

                            {/* Gráfica 2 — Humedad y Viento */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Humedad y viento — últimos 7 días
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoClima
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaHumedadViento lecturas={lectClima} />
                                    }
                                </div>
                            </div>

                            {/* Gráfica 3 — Potencia Fotovoltaica */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Sistema fotovoltaico — últimos 7 días
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoSolar
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaElectrico
                                            lecturas={lectSolar}
                                            color="#F5A623"
                                            colorFondo="rgba(245,166,35,0.13)"
                                            label="Potencia Solar (W)"
                                        />
                                    }
                                </div>
                            </div>

                            {/* Gráfica 4 — Potencia Eólica */}
                            <div className="graficas-chart-card">
                                <h3 className="graficas-chart-card__titulo">
                                    Sistema eólico — últimos 7 días
                                </h3>
                                <div className="graficas-chart-card__body">
                                    {cargandoEolica
                                        ? <div className="graficas-skeleton" />
                                        : <GraficaLineaElectrico
                                            lecturas={lectEolica}
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
