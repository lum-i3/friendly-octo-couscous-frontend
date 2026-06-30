import UserIcon from '../assets/Icons/UserIcon.png';
import '../styles/sidebar.css';

/**
 * Sección de perfil de la sidebar.
 * - user = null  → ícono de visitante con fondo #10475C.
 * - user = { nombre, foto? } → foto de perfil (o ícono si no tiene foto) + nombre.
 */
function SidebarPerfil({ user = null, isOpen }) {
    const avatarClass = `sidebar-perfil__avatar ${isOpen ? 'sidebar-perfil__avatar--open' : 'sidebar-perfil__avatar--closed'}`;

    return (
        <div className="sidebar-perfil">
            <div className={avatarClass}>
                {user?.foto ? (
                    <img
                        src={user.foto}
                        alt={user.nombre ?? 'Foto de perfil'}
                        className="sidebar-perfil__foto"
                    />
                ) : (
                    <img
                        src={UserIcon}
                        alt="Visitante"
                        className="sidebar-perfil__visitor-icon"
                    />
                )}
            </div>

            {isOpen && user?.nombre && (
                <span className="sidebar-perfil__nombre">{user.nombre}</span>
            )}
        </div>
    );
}

export default SidebarPerfil;
