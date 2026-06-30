import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuIcon from '../assets/Icons/MenuIcon.png';
import SidebarPerfil from './SidebarPerfil';
import SidebarLoginBtn from './SidebarLoginBtn';
import SidebarNavItem from './SidebarNavItem';
import ContentHeader from './ContentHeader';
import '../styles/sidebar.css';

function SidebarLayout({
    children,
    navItems = [],
    defaultActiveKey,
    titulo,
    onBack,
    onHome,
    user = null,
    onLogin,
}) {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    // Detecta el ítem activo únicamente por URL; sin coincidencia → nada activo
    const activeKey =
        navItems.find(item => item.to && location.pathname === item.to)?.key
        ?? null;

    return (
        <div className="sidebar-viewport">

            {/*SIDEBAR*/}
            <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>

                {/*Botón hamburguesa*/}
                <button
                    className="sidebar-hamburger"
                    onClick={() => setIsOpen(o => !o)}
                    aria-label="Alternar menú"
                >
                    <img src={MenuIcon} alt="" className="sidebar-hamburger__icon" />
                </button>

                {/*Sección de perfil*/}
                <SidebarPerfil user={user} isOpen={isOpen} />

                {/*Botón de inicio de sesión (solo visitantes)*/}
                {!user && (
                    <SidebarLoginBtn onClick={onLogin} isOpen={isOpen} />
                )}

                {/*Navegación*/}
                <nav className="sidebar-nav" aria-label="Menú principal">
                    {navItems.map(item => (
                        <SidebarNavItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeKey === item.key}
                            isOpen={isOpen}
                            to={item.to}
                        />
                    ))}
                </nav>
            </aside>

            {/*ÁREA DE CONTENIDO*/}
            <main className="sidebar-main">

                {/*Encabezado (solo si hay título o al menos un botón de acción)*/}
                {(titulo !== undefined || onBack || onHome) && (
                    <ContentHeader titulo={titulo} onBack={onBack} onHome={onHome} />
                )}

                <div className="sidebar-content-body">
                    {children}
                </div>
            </main>

        </div>
    );
}

export default SidebarLayout;
