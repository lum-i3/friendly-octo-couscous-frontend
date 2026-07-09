import { useNavigate } from 'react-router-dom';
import IniciarSesionIcon from '../assets/Icons/IniciarSesionIcon.png';
import '../styles/sidebar.css';

function SidebarLoginBtn({ onClick, isOpen }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate('/login');
    };

    return (
        <button
            className={`sidebar-login-btn ${isOpen ? 'sidebar-login-btn--open' : 'sidebar-login-btn--closed'}`}
            onClick={handleClick}
            title={!isOpen ? 'Iniciar sesión' : undefined}
            aria-label="Iniciar sesión"
        >
            <img src={IniciarSesionIcon} alt="" className="sidebar-login-btn__icon" />
            {isOpen && 'Iniciar sesión'}
        </button>
    );
}

export default SidebarLoginBtn;
