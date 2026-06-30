import BackIcon from '../assets/Icons/BackIcon.png';
import '../styles/sidebar.css';

/**
 * Botón de retroceso del encabezado de contenido.
 */
function NavBackBtn({ onClick }) {
    return (
        <button
            className="nav-action-btn"
            onClick={onClick}
            aria-label="Atrás"
        >
            <img src={BackIcon} alt="" className="nav-action-btn__icon" />
        </button>
    );
}

export default NavBackBtn;
