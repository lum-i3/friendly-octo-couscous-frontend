import UltimosDataTableRow from './UltimosDataTableRow';

function UltimosDataTableBody({ lecturas = [] }) {
    if (lecturas.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={6} className="tabla-ultimos__empty">
                        Sin datos disponibles.
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {lecturas.map((lectura) => (
                <UltimosDataTableRow key={lectura.idLectura} lectura={lectura} />
            ))}
        </tbody>
    );
}

export default UltimosDataTableBody;
