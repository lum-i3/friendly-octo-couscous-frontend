import '../styles/sidebar.css';

/**
 * Botón de navegación individual de la sidebar.
 * `icon` acepta un <img> o <svg> según corresponda al ítem.
 */
function SidebarNavItem({ icon, label, isActive, isOpen, onClick }) {
    return (
        <button
            className={[
                'sidebar-nav-item',
                isActive ? 'sidebar-nav-item--active' : '',
                isOpen ? 'sidebar-nav-item--open' : 'sidebar-nav-item--closed',
            ].join(' ')}
            onClick={onClick}
            title={!isOpen ? label : undefined}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="sidebar-nav-item__icon">{icon}</span>
            {isOpen && <span className="sidebar-nav-item__label">{label}</span>}
        </button>
    );
}

export default SidebarNavItem;
