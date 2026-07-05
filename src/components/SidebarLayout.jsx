import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import MenuIcon from '../assets/Icons/MenuIcon.png';
import SidebarPerfil from './SidebarPerfil';
import SidebarLoginBtn from './SidebarLoginBtn';
import SidebarLogoutBtn from './SidebarLogoutBtn';
import SidebarNavItem from './SidebarNavItem';
import ContentHeader from './ContentHeader';
import useInactividadSesion from '../hooks/useInactividadSesion';
import '../styles/sidebar.css';

function SidebarLayout({
    children,
    navItems = [],
    defaultActiveKey,
    titulo,
    onBack,
    onHome,
    actions,
    user = null,
    onLogin,
    collapsed = false,
}) {
    const [isOpen, setIsOpen] = useState(!collapsed);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsOpen(!collapsed);
    }, [collapsed]);

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

    const handleInactividad = useCallback(() => {
        Swal.fire({
            title: 'Sesión cerrada por inactividad',
            text: 'No se detectó actividad durante 30 minutos.',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#176682',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => {
            localStorage.removeItem('jwt');
            navigate('/login', { replace: true });
        });
    }, [navigate]);

    useInactividadSesion(!!user, handleInactividad);

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

                {/*Botón de cerrar sesión (solo usuarios autenticados)*/}
                {user && (
                    <SidebarLogoutBtn onClick={handleLogout} isOpen={isOpen} />
                )}
            </aside>

            {/*ÁREA DE CONTENIDO*/}
            <main className="sidebar-main">

                {/*Encabezado (solo si hay título o al menos un botón de acción)*/}
                {(titulo !== undefined || onBack || onHome || actions) && (
                    <ContentHeader titulo={titulo} onBack={onBack} onHome={onHome} actions={actions} />
                )}

                <div className="sidebar-content-body">
                    {children}
                </div>
            </main>

        </div>
    );
}

export default SidebarLayout;
