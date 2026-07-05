import ExitIcon from '../assets/Icons/ExitIcon.png';
import '../styles/sidebar.css';

function SidebarLogoutBtn({ onClick, isOpen }) {
    return (
        <button
            className={`sidebar-logout-btn ${isOpen ? 'sidebar-logout-btn--open' : 'sidebar-logout-btn--closed'}`}
            onClick={onClick}
            title={!isOpen ? 'Cerrar sesión' : undefined}
            aria-label="Cerrar sesión"
            type="button"
        >
            <img src={ExitIcon} alt="" className="sidebar-logout-btn__icon" />
            {isOpen && <span>Cerrar sesión</span>}
        </button>
    );
}

export default SidebarLogoutBtn;
