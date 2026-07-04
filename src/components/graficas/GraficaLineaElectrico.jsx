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
 * Gráfica de área para potencia eléctrica histórica (solar o eólica).
 * Reutilizable: se configura con props de color y etiqueta.
 *
 * lecturas  → ElectricReadingDTO[]
 * color     → color principal de la línea
 * colorFond → color de relleno (rgba)
 * label     → etiqueta del dataset
 */
function GraficaLineaElectrico({
    lecturas = [],
    color     = '#176682',
    colorFondo = 'rgba(23,102,130,0.13)',
    label     = 'Potencia (W)',
}) {
    if (lecturas.length === 0) {
        return <div style={SIN_DATOS_STYLE}>Sin datos para el período seleccionado.</div>;
    }

    const labels = lecturas.map(l => fmtFecha(l.fechaLectura));

    const data = {
        labels,
        datasets: [
            {
                label,
                data: lecturas.map(l => l.potencia ?? null),
                borderColor: color,
                backgroundColor: colorFondo,
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                pointHitRadius: 8,
                tension: 0.3,
                yAxisID: 'y',
            },
            {
                label: 'Voltaje (V)',
                data: lecturas.map(l => l.voltaje ?? null),
                borderColor: '#FDCB6E',
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderDash: [4, 3],
                fill: false,
                pointRadius: 0,
                pointHitRadius: 8,
                tension: 0.3,
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
                        const unidad = ctx.dataset.yAxisID === 'y' ? 'W' : 'V';
                        return ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)} ${unidad}`;
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
                beginAtZero: true,
                grid: { color: 'rgba(23,102,130,0.07)' },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color,
                    callback: (v) => `${v} W`,
                },
                title: {
                    display: true,
                    text: 'Potencia (W)',
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color,
                },
            },
            y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false },
                ticks: {
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color: '#c8a030',
                    callback: (v) => `${v} V`,
                },
                title: {
                    display: true,
                    text: 'Voltaje (V)',
                    font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                    color: '#c8a030',
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

export default GraficaLineaElectrico;
