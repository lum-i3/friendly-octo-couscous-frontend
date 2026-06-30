import HomeIcon from '../assets/Icons/HomeIcon.png';
import '../styles/sidebar.css';

/**
 * Botón de inicio del encabezado de contenido.
 */
function NavHomeBtn({ onClick }) {
    return (
        <button
            className="nav-action-btn"
            onClick={onClick}
            aria-label="Inicio"
        >
            <img src={HomeIcon} alt="" className="nav-action-btn__icon" />
        </button>
    );
}

export default NavHomeBtn;
