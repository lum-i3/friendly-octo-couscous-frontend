import TableHeaderCell from './TableHeaderCell';

const COLUMNAS = ['Fecha', 'Hora', 'Temperatura', 'Viento', 'Radiación', 'Humedad'];

function UltimosDataTableHeader() {
    return (
        <thead>
            <tr>
                {COLUMNAS.map((col) => (
                    <TableHeaderCell key={col}>{col}</TableHeaderCell>
                ))}
            </tr>
        </thead>
    );
}

export default UltimosDataTableHeader;
