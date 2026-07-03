import '../../styles/dashboard.css';

const VARIABLES = [
    { label: 'Temperatura', min: 'minTemperatura', avg: 'promedioTemperatura', max: 'maxTemperatura', unidad: '°C' },
    { label: 'Humedad',     min: 'minHumedad',     avg: 'promedioHumedad',     max: 'maxHumedad',     unidad: '%'  },
    { label: 'Viento',      min: 'minViento',      avg: 'promedioViento',      max: 'maxViento',      unidad: 'm/s' },
    { label: 'Radiación',   min: 'minRadiacion',   avg: 'promedioRadiacion',   max: 'maxRadiacion',   unidad: 'W/m²' },
    { label: 'Presión',     min: 'minPresion',     avg: 'promedioPresion',     max: 'maxPresion',     unidad: 'hPa' },
];

function fmt(val) {
    if (val == null) return '—';
    return Number(val).toFixed(1);
}

function ChartStatsClimaticas({ stats }) {
    if (!stats) {
        return (
            <div className="stats-climate-empty">
                Sin datos disponibles para el período.
            </div>
        );
    }

    return (
        <div className="stats-climate-table">
            <div className="stats-climate-row stats-climate-row--header">
                <span>Variable</span>
                <span>Mínimo</span>
                <span>Promedio</span>
                <span>Máximo</span>
            </div>
            {VARIABLES.map((v, i) => (
                <div
                    key={v.label}
                    className={`stats-climate-row${i % 2 === 1 ? ' stats-climate-row--alt' : ''}`}
                >
                    <span className="stats-climate-var">{v.label}</span>
                    <span className="stats-climate-min">
                        {fmt(stats[v.min])} <em>{v.unidad}</em>
                    </span>
                    <span className="stats-climate-avg">
                        {fmt(stats[v.avg])} <em>{v.unidad}</em>
                    </span>
                    <span className="stats-climate-max">
                        {fmt(stats[v.max])} <em>{v.unidad}</em>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default ChartStatsClimaticas;
