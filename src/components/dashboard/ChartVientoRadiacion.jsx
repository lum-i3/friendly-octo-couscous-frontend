import { PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                padding: 12,
                boxWidth: 12,
            },
        },
        tooltip: {
            callbacks: {
                label: (ctx) => ` ${ctx.raw}`,
            },
        },
    },
    scales: {
        r: {
            ticks: { display: false, backdropColor: 'transparent' },
            grid: { color: 'rgba(23,102,130,0.12)' },
        },
    },
};

/**
 * Muestra viento y radiación como PolarArea para visualizar
 * magnitudes independientes sin distorsión de escala.
 * lectura → ClimateReadingDTO (ultimaLecturaClimatica)
 */
function ChartVientoRadiacion({ lectura }) {
    const data = {
        labels: ['Viento (m/s)', 'Radiación (W/m²)'],
        datasets: [{
            data: [lectura?.viento ?? 0, lectura?.radiacion ?? 0],
            backgroundColor: ['rgba(108, 92, 231, 0.70)', 'rgba(253, 203, 110, 0.85)'],
            borderColor: ['#6C5CE7', '#FDCB6E'],
            borderWidth: 1.5,
        }],
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <PolarArea data={data} options={OPTIONS} />
        </div>
    );
}

export default ChartVientoRadiacion;
