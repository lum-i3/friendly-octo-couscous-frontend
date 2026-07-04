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
 * Gráfica de líneas doble eje: Humedad (%) eje izquierdo, Viento (m/s) eje derecho.
 * lecturas → ClimateReadingDTO[]
 */
function GraficaLineaHumedadViento({ lecturas = [] }) {
    if (lecturas.length === 0) {
        return <div style={SIN_DATOS_STYLE}>Sin datos para el período seleccionado.</div>;
    }

    const labels = lecturas.map(l => fmtFecha(l.fechaLectura));

    const data = {
        labels,
        datasets: [
            {
                label: 'Humedad (%)',
                data: lecturas.map(l => l.humedad ?? null),
                borderColor: '#176682',
                backgroundColor: 'rgba(23,102,130,0.12)',
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                pointHitRadius: 8,
                tension: 0.35,
                yAxisID: 'y',
            },
            {
                label: 'Viento (m/s)',
                data: lecturas.map(l => l.viento ?? null),
                borderColor: '#6C5CE7',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 3],
                fill: false,
                pointRadius: 0,
                pointHitRadius: 8,
                tension: 0.35,
                yAxisID: 'y1',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                    padding: 12,
                    boxWidth: 12,
                    usePointStyle: true,
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const unidades = { 'Humedad (%)': '%', 'Viento (m/s)': 'm/s' };
                        return ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(1)} ${unidades[ctx.dataset.label] ?? ''}`;
                    },
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
                type: 'linear',
                position: 'left',
                min: 0,
                max: 100,
                grid: { color: 'rgba(23,102,130,0.08)' },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color: '#176682',
                    callback: (v) => `${v}%`,
                },
            },
            y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color: '#6C5CE7',
                    callback: (v) => `${v} m/s`,
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

export default GraficaLineaHumedadViento;
