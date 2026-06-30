import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

function SidebarNavItem({ icon, label, isActive, isOpen, to, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
        if (onClick) onClick();
    };

    return (
        <button
            className={[
                'sidebar-nav-item',
                isActive ? 'sidebar-nav-item--active' : '',
                isOpen ? 'sidebar-nav-item--open' : 'sidebar-nav-item--closed',
            ].join(' ')}
            onClick={handleClick}
            title={!isOpen ? label : undefined}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="sidebar-nav-item__icon">{icon}</span>
            {isOpen && <span className="sidebar-nav-item__label">{label}</span>}
        </button>
    );
}

export default SidebarNavItem;
