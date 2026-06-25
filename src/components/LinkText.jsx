import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

/**
 * Enlace de texto reutilizable (ej. "Crear cuenta", "¿Olvidaste tu contraseña?").
 * Si recibe `to`, navega con react-router; `onClick` se ejecuta siempre antes.
 */
function LinkText({ to, onClick, children, className = '' }) {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        if (to) navigate(to);
    };

    return (
        <a href={to || '#'} onClick={handleClick} className={`link-text ${className}`}>
            {children}
        </a>
    );
}

export default LinkText;
