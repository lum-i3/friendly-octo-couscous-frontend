import TableDataCell from './TableDataCell';

function parseFechaLectura(isoString) {
    if (!isoString) return { fecha: '--', hora: '--' };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { fecha: '--', hora: '--' };
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh   = String(d.getHours()).padStart(2, '0');
    const min  = String(d.getMinutes()).padStart(2, '0');
    const ss   = String(d.getSeconds()).padStart(2, '0');
    return { fecha: `${dd}/${mm}/${yyyy}`, hora: `${hh}:${min}:${ss}` };
}

/**
 * lectura: ClimateReadingDTO del backend
 * {
 *   idLectura, fechaLectura, temperatura, viento,
 *   humedad, radiacion, presion, rainRate, dailyRain, rainTotal
 * }
 */
function UltimosDataTableRow({ lectura }) {
    const { fecha, hora } = parseFechaLectura(lectura?.fechaLectura);

    return (
        <tr className="tabla-ultimos__tr">
            <TableDataCell>{fecha}</TableDataCell>
            <TableDataCell>{hora}</TableDataCell>
            <TableDataCell>
                {lectura?.temperatura != null ? `${lectura.temperatura}°` : '--'}
            </TableDataCell>
            <TableDataCell>
                {lectura?.viento != null ? lectura.viento : '--'}
            </TableDataCell>
            <TableDataCell>
                {lectura?.radiacion != null ? lectura.radiacion : '--'}
            </TableDataCell>
            <TableDataCell>
                {lectura?.humedad != null ? `${lectura.humedad}%` : '--'}
            </TableDataCell>
        </tr>
    );
}

export default UltimosDataTableRow;
