import { useState } from 'react';
import UserIcon from '../assets/Icons/UserIcon.png';
import '../styles/sidebar.css';

function toFotoSrc(foto) {
    if (!foto) return null;
    if (foto.startsWith('data:') || foto.startsWith('http')) return foto;
    return `data:image/jpeg;base64,${foto}`;
}

function SidebarPerfil({ user = null, isOpen }) {
    const [fotoError, setFotoError] = useState(false);
    const avatarClass = `sidebar-perfil__avatar ${isOpen ? 'sidebar-perfil__avatar--open' : 'sidebar-perfil__avatar--closed'}`;
    const fotoSrc = !fotoError ? toFotoSrc(user?.foto) : null;

    return (
        <div className="sidebar-perfil">
            <div className={avatarClass}>
                {fotoSrc ? (
                    <img
                        src={fotoSrc}
                        alt={user.nombre ?? 'Foto de perfil'}
                        className="sidebar-perfil__foto"
                        onError={() => setFotoError(true)}
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
