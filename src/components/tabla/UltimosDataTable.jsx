import UltimosDataTableHeader from './UltimosDataTableHeader';
import UltimosDataTableBody from './UltimosDataTableBody';
import '../../styles/tabla.css';

/**
 * Props:
 *   lecturas: ClimateReadingDTO[]  — array de lecturas para la página actual
 *
 * Cuando el backend esté conectado, pasar los datos de:
 *   GET /api/telemetria/climatica?inicio=...&fin=...&page=X&size=12
 *   response.data.contenido
 */
function UltimosDataTable({ lecturas = [] }) {
    return (
        <div className="tabla-ultimos-wrapper">
            <table className="tabla-ultimos">
                <UltimosDataTableHeader />
                <UltimosDataTableBody lecturas={lecturas} />
            </table>
        </div>
    );
}

export default UltimosDataTable;
