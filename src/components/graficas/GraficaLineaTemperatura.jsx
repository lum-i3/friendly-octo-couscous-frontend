import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function fmtFecha(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const SIN_DATOS_STYLE = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '0.82rem', color: 'var(--color-text-muted)',
};

/**
 * Gráfica de área para temperatura histórica.
 * lecturas → ClimateReadingDTO[] (ordenado ascendente por fecha)
 */
function GraficaLineaTemperatura({ lecturas = [] }) {
    if (lecturas.length === 0) {
        return <div style={SIN_DATOS_STYLE}>Sin datos para el período seleccionado.</div>;
    }

    const labels = lecturas.map(l => fmtFecha(l.fechaLectura));

    const data = {
        labels,
        datasets: [{
            label: 'Temperatura (°C)',
            data: lecturas.map(l => l.temperatura ?? null),
            borderColor: '#e05050',
            backgroundColor: 'rgba(224,80,80,0.13)',
            borderWidth: 2,
            fill: true,
            pointRadius: 0,
            pointHitRadius: 8,
            tension: 0.35,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${Number(ctx.raw).toFixed(1)} °C`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    maxTicksLimit: 10,
                    autoSkip: true,
                    maxRotation: 25,
                },
            },
            y: {
                grid: { color: 'rgba(224,80,80,0.08)' },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    callback: (v) => `${v} °C`,
                },
            },
        },
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
}

export default GraficaLineaTemperatura;
