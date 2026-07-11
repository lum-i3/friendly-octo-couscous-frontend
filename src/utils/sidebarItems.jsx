import IconGraficas from '../assets/Icons/IconGraficas.png';
import TablaIcon from '../assets/Icons/TablaIcon.png';
import UserIcon from '../assets/Icons/UserIcon.png';
import EstacionLogo from '../assets/Icons/LogoEstacion.png';
import DescargaLogo from '../assets/Icons/DescargaLogo.png';
import UsuariosLogo from '../assets/Icons/UsuariosLogo.png';
import SolicitudLogo from '../assets/Icons/SolicitudLogo.png';
import HistorialLogo from '../assets/Icons/HistorialLogo.png';
import PerfilIcon from '../assets/Icons/PerfilIcon.png';

/** Ítems disponibles para el rol VISITANTE */
export const VISITANTE_ITEMS = [
    { key: 'graficas', to: '/graficas',    label: 'Gráficas',      icon: <img src={IconGraficas} alt="" /> },
    { key: 'tabla',    to: '/tabla-datos', label: 'Tabla de datos', icon: <img src={TablaIcon}   alt="" /> },
];

/** Ítems disponibles para el rol ADMINISTRADOR */
export const ADMIN_ITEMS = [
    { key: 'usuarios',         to: '/admin/usuarios',          label: 'Usuarios activos',         icon: <img src={UsuariosLogo} alt="" /> },
    { key: 'administradores',  to: '/admin/administradores',   label: 'Administradores activos',  icon: <img src={UserIcon} alt="" /> },
    { key: 'solicitudes',      to: '/admin/solicitudes',       label: 'Solicitudes de descargas', icon: <img src={SolicitudLogo} alt="" /> },
    { key: 'historial',        to: '/admin/historial',         label: 'Historial de acciones',    icon: <img src={HistorialLogo} alt="" /> },
    { key: 'perfil',           to: '/admin/perfil',            label: 'Mi perfil y preferencias', icon: <img src={PerfilIcon} alt="" /> },
];

/** Ítems disponibles para el rol USUARIO autenticado */
export const USUARIO_ITEMS = [
    { key: 'graficas',  to: '/usuario/graficas',   label: 'Gráficas',                   icon: <img src={IconGraficas} alt="" /> },
    { key: 'estacion',  to: '/usuario/estacion',   label: 'Mi estación',                 icon: <img src={EstacionLogo} alt="" /> },
    { key: 'descargar', to: '/usuario/descargar',  label: 'Descargar gráficas',          icon: <img src={DescargaLogo} alt="" /> },
    { key: 'perfil',    to: '/usuario/editar-perfil', label: 'Mi perfil y preferencias',    icon: <img src={UserIcon} alt="" /> },
    { key: 'tabla',     to: '/usuario/tabla-datos',label: 'Tabla de datos',              icon: <img src={TablaIcon} alt="" /> },
];
