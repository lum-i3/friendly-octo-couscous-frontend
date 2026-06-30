import '../../styles/tabla.css';

function TableSectionTitle({ titulo = 'Últimos datos registrados' }) {
    return <h2 className="tabla-section-title">{titulo}</h2>;
}

export default TableSectionTitle;
