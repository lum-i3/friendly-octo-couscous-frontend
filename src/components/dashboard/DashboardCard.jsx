import '../../styles/dashboard.css';

/**
 * Tarjeta reutilizable para el dashboard.
 * Props:
 *   titulo   — string
 *   wide     — boolean (ocupa las 3 columnas del grid)
 *   cargando — boolean (muestra skeleton)
 *   children — contenido (chart u otro)
 */
function DashboardCard({ titulo, children, wide = false, cargando = false }) {
    return (
        <div className={`dashboard-card${wide ? ' dashboard-card--wide' : ''}`}>
            <h3 className="dashboard-card__titulo">{titulo}</h3>
            <div className="dashboard-card__body">
                {cargando
                    ? <div className="dashboard-skeleton" />
                    : children
                }
            </div>
        </div>
    );
}

export default DashboardCard;
