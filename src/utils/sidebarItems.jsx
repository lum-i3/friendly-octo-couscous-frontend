import IconGraficas from '../assets/Icons/IconGraficas.png';
import TablaIcon from '../assets/Icons/TablaIcon.png';
import UserIcon from '../assets/Icons/UserIcon.png';
import EstacionLogo from '../assets/Icons/LogoEstacion.png';
import DescargaLogo from '../assets/Icons/DescargaLogo.png';

/** Ítems disponibles para el rol VISITANTE */
export const VISITANTE_ITEMS = [
    { key: 'graficas', to: '/graficas',    label: 'Gráficas',      icon: <img src={IconGraficas} alt="" /> },
    { key: 'tabla',    to: '/tabla-datos', label: 'Tabla de datos', icon: <img src={TablaIcon}   alt="" /> },
];

/** Ítems disponibles para el rol USUARIO autenticado */
export const USUARIO_ITEMS = [
    { key: 'graficas',  to: '/usuario/graficas',   label: 'Gráficas',                   icon: <img src={IconGraficas} alt="" /> },
    { key: 'estacion',  to: '/usuario/estacion',   label: 'Mi estación',                 icon: <img src={EstacionLogo} alt="" /> },
    { key: 'descargar', to: '/usuario/descargar',  label: 'Descargar gráficas',          icon: <img src={DescargaLogo} alt="" /> },
    { key: 'perfil',    to: '/usuario/perfil',     label: 'Mi perfil y preferencias',    icon: <img src={UserIcon} alt="" /> },
    { key: 'tabla',     to: '/usuario/tabla-datos',label: 'Tabla de datos',              icon: <img src={TablaIcon} alt="" /> },
];
