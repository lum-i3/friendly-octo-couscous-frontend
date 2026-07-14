import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import MapaInteractivo from '../../components/mapa/MapaInteractivo';
import useTelemetriaResumen from '../../hooks/useTelemetriaResumen';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import TemperaturaIcon from '../../assets/Icons/TemperaturaIcon.png';
import VelocidadVientoIcon from '../../assets/Icons/VelocidadVientoIcon.png';
import RadianciaIcon from '../../assets/Icons/RadianciaIcon.png';
import '../../styles/dashboard.css';
import '../../styles/estacion.css';

const CARDS = [
    { key: 'viento',    icon: VelocidadVientoIcon, label: 'Velocidad del viento', campo: 'viento',      unidad: 'm/s'  },
    { key: 'temp',      icon: TemperaturaIcon,      label: 'Temperatura',          campo: 'temperatura', unidad: '°C'   },
    { key: 'radiacion', icon: RadianciaIcon,        label: 'Radiancia',            campo: 'radiacion',   unidad: 'W/m²' },
];

function EstacionCard({ icon, label, valor, unidad, cargando }) {
    return (
        <div className="estacion-card">
            <img src={icon} alt={label} className="estacion-card__icon" />
            <span className="estacion-card__label">{label}</span>
            {cargando ? (
                <div
                    className="dashboard-skeleton"
                    style={{ width: 80, height: 36, minHeight: 'unset', borderRadius: 8 }}
                />
            ) : valor != null ? (
                <span className="estacion-card__valor">
                    {Number(valor).toFixed(1)}
                    <span className="estacion-card__unidad">{unidad}</span>
                </span>
            ) : (
                <span className="estacion-card__sin-datos">Sin datos</span>
            )}
        </div>
    );
}

function MiEstacionUsuario() {
    const navigate = useNavigate();
    const [pantallaCompleta, setPantallaCompleta] = useState(false);
    const { datos, cargando, error } = useTelemetriaResumen();
    const { perfil } = useUserProfile();

    const clima = datos?.ultimaLecturaClimatica;

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    return (
        <div className={`page-with-header estacion-page-wrapper${pantallaCompleta ? ' estacion-page-wrapper--fullscreen' : ''}`}>
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Mi estación"
                    onBack={() => navigate(-1)}
                    onHome={() => navigate('/')}
                    collapsed={pantallaCompleta}
                >
                    {error && !cargando && (
                        <div className="dashboard-error">
                            <span>No se pudo cargar la telemetría de la estación.</span>
                            <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{error}</span>
                        </div>
                    )}

                    {/* Mapa con controles de pantalla completa */}
                    <div className="estacion-mapa-wrapper">
                        <MapaInteractivo
                            pantallaCompleta={pantallaCompleta}
                            onTogglePantallaCompleta={() => setPantallaCompleta(p => !p)}
                            clima={clima}
                        />
                    </div>

                    {/* Cards de información (ocultas en pantalla completa) */}
                    {!pantallaCompleta && (
                        <div className="estacion-cards-row">
                            {CARDS.map(card => (
                                <EstacionCard
                                    key={card.key}
                                    icon={card.icon}
                                    label={card.label}
                                    valor={clima?.[card.campo]}
                                    unidad={card.unidad}
                                    cargando={cargando}
                                />
                            ))}
                        </div>
                    )}
                </SidebarLayout>
            </div>
        </div>
    );
}

export default MiEstacionUsuario;
