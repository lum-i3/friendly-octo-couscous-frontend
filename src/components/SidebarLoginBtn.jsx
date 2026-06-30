import '../styles/sidebar.css';

/**
 * Botón "Iniciar sesión" de la sidebar, visible únicamente para visitantes.
 * Cuando la sidebar está cerrada el texto desaparece y queda un bloque verde compacto.
 */
function SidebarLoginBtn({ onClick, isOpen }) {
    return (
        <button
            className={`sidebar-login-btn ${isOpen ? 'sidebar-login-btn--open' : 'sidebar-login-btn--closed'}`}
            onClick={onClick}
            title={!isOpen ? 'Iniciar sesión' : undefined}
            aria-label="Iniciar sesión"
        >
            {isOpen ? 'Iniciar sesión' : ''}
        </button>
    );
}

export default SidebarLoginBtn;
