import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Eje Y izquierdo → Viento (m/s), escala 0-50
// Eje Y derecho   → Radiación (W/m²) y Presión (hPa), escalas propias
const OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                padding: 14,
                boxWidth: 12,
            },
        },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const unidades = { 'Viento (m/s)': 'm/s', 'Radiación (W/m²)': 'W/m²', 'Presión (hPa)': 'hPa' };
                    return ` ${ctx.dataset.label}: ${ctx.raw} ${unidades[ctx.dataset.label] ?? ''}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 12, family: "'Inter', system-ui, sans-serif" } },
        },
        // Eje izquierdo: Viento
        y: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
                display: true,
                text: 'Viento (m/s)',
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                color: '#6C5CE7',
            },
            grid: { color: 'rgba(23, 102, 130, 0.07)' },
            ticks: { font: { size: 11 }, color: '#6C5CE7' },
        },
        // Eje derecho: Radiación y Presión
        y1: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            title: {
                display: true,
                text: 'Radiación (W/m²) / Presión (hPa)',
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                color: '#FDCB6E',
            },
            grid: { drawOnChartArea: false },
            ticks: { font: { size: 11 }, color: '#FDCB6E' },
        },
    },
};

/**
 * Gráfica de barras agrupada con doble eje Y para viento, radiación y presión.
 * El eje izquierdo escala el viento (m/s); el derecho, radiación (W/m²) y presión (hPa).
 *
 * lectura → ClimateReadingDTO (ultimaLecturaClimatica)
 * Conectar desde: GET /api/telemetria/resumen → datos.ultimaLecturaClimatica
 */
function GraficaVientoRadiacion({ lectura }) {
    const data = {
        labels: ['Última lectura'],
        datasets: [
            {
                label: 'Viento (m/s)',
                data: [lectura?.viento ?? 0],
                backgroundColor: 'rgba(108, 92, 231, 0.78)',
                borderColor: '#6C5CE7',
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y',
            },
            {
                label: 'Radiación (W/m²)',
                data: [lectura?.radiacion ?? 0],
                backgroundColor: 'rgba(253, 203, 110, 0.85)',
                borderColor: '#FDCB6E',
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y1',
            },
            {
                label: 'Presión (hPa)',
                data: [lectura?.presion ?? 0],
                backgroundColor: 'rgba(78, 205, 196, 0.80)',
                borderColor: '#4ECDC4',
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y1',
            },
        ],
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Bar data={data} options={OPTIONS} />
        </div>
    );
}

export default GraficaVientoRadiacion;
