import TableHeaderCell from './TableHeaderCell';
import TableDataCell from './TableDataCell';
import '../../styles/tabla.css';

const COLS = [
    { key: 'temperatura', label: 'Temperatura', render: l => l.temperatura != null ? `${l.temperatura}°` : '--' },
    { key: 'viento',      label: 'Viento',      render: l => l.viento      != null ? l.viento              : '--' },
    { key: 'radiacion',   label: 'Radiación',   render: l => l.radiacion   != null ? l.radiacion            : '--' },
    { key: 'humedad',     label: 'Humedad',     render: l => l.humedad     != null ? `${l.humedad}%`        : '--' },
];

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

function TablaConFiltros({ lecturas = [], columnas }) {
    const colsVisibles = COLS.filter(c => columnas[c.key]);
    const totalCols = 2 + colsVisibles.length;

    return (
        <div className="tabla-ultimos-wrapper">
            <table className="tabla-ultimos">
                <thead>
                    <tr>
                        <TableHeaderCell>Fecha</TableHeaderCell>
                        <TableHeaderCell>Hora</TableHeaderCell>
                        {colsVisibles.map(c => (
                            <TableHeaderCell key={c.key}>{c.label}</TableHeaderCell>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lecturas.length === 0 ? (
                        <tr>
                            <td colSpan={totalCols} className="tabla-ultimos__empty">
                                Sin datos disponibles.
                            </td>
                        </tr>
                    ) : (
                        lecturas.map(l => {
                            const { fecha, hora } = parseFechaLectura(l.fechaLectura);
                            return (
                                <tr key={l.idLectura} className="tabla-ultimos__tr">
                                    <TableDataCell>{fecha}</TableDataCell>
                                    <TableDataCell>{hora}</TableDataCell>
                                    {colsVisibles.map(c => (
                                        <TableDataCell key={c.key}>{c.render(l)}</TableDataCell>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TablaConFiltros;
