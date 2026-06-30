import IconGraficas from '../assets/Icons/IconGraficas.png';
import TablaIcon from '../assets/Icons/TablaIcon.png';
import UserIcon from '../assets/Icons/UserIcon.png';

// SVG para ítems sin ícono PNG disponible aún
const StationSvg = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
);

const DownloadSvg = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

/** Ítems disponibles para el rol VISITANTE */
export const VISITANTE_ITEMS = [
    { key: 'graficas', label: 'Gráficas',       icon: <img src={IconGraficas} alt="" /> },
    { key: 'tabla',    label: 'Tabla de datos',  icon: <img src={TablaIcon}   alt="" /> },
];

/** Ítems disponibles para el rol USUARIO autenticado */
export const USUARIO_ITEMS = [
    { key: 'graficas',  label: 'Gráficas',                   icon: <img src={IconGraficas} alt="" /> },
    { key: 'estacion',  label: 'Mi estación',                 icon: StationSvg },
    { key: 'descargar', label: 'Descargar gráficas',          icon: DownloadSvg },
    { key: 'perfil',    label: 'Mi perfil y preferencias',    icon: <img src={UserIcon} alt="" /> },
    { key: 'tabla',     label: 'Tabla de datos',              icon: <img src={TablaIcon} alt="" /> },
];
