import { useState } from "react";
import "./../style/sidebar.css";

const icons = {
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  station: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  ),
  download: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  table: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/>
    </svg>
  ),
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
};

const navItems = [
  { key: "graficas",  icon: icons.chart,    label: "Gráficas" },
  { key: "estacion",  icon: icons.station,  label: "Mi estación" },
  { key: "descargar", icon: icons.download, label: "Descargar gráficas" },
  { key: "perfil",    icon: icons.user,     label: "Mi perfil y preferencias" },
  { key: "tabla",     icon: icons.table,    label: "Tabla de datos" },
];

function SidebarLayout({ children }) {
  const [isOpen, setIsOpen]       = useState(true);
  const [activeKey, setActiveKey] = useState("tabla");

  const activeLabel = navItems.find(i => i.key === activeKey)?.label ?? "";

  return (
    <div className="viewport">
      <div className="body-wrapper">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setIsOpen(o => !o)} aria-label="Alternar menú">
            {icons.menu}
          </button>

          {/* Avatar */}
          <div className={`profile-section ${isOpen ? "profile-section--open" : ""}`}>
            <div className={`avatar ${isOpen ? "avatar--open" : "avatar--closed"}`}>
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                alt="Usuario"
                className="avatar__img"
              />
            </div>
            {isOpen && <span className="profile-name">Nombre</span>}
          </div>

          {/* Navegación */}
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={[
                  "nav-item",
                  activeKey === item.key ? "nav-item--active" : "",
                  isOpen ? "nav-item--open" : "nav-item--closed",
                ].join(" ")}
                onClick={() => setActiveKey(item.key)}
                title={!isOpen ? item.label : undefined}
                aria-current={activeKey === item.key ? "page" : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main className="main-content">
          <div className="content-header">
            <div className="page-title-pill">{activeLabel}</div>
            <div className="header-actions">
              <button className="header-btn" aria-label="Atrás">{icons.back}</button>
              <button className="header-btn" aria-label="Inicio">{icons.home}</button>
            </div>
          </div>

          <div className="content-body">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default SidebarLayout;