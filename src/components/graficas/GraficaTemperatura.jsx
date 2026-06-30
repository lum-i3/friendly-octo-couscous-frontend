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

const OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const unidades = ['°C', '%', 'mm/h', 'mm'];
                    return ` ${ctx.raw} ${unidades[ctx.dataIndex] ?? ''}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
            },
        },
        y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(23, 102, 130, 0.08)' },
            ticks: {
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                stepSize: 20,
            },
        },
    },
};

/**
 * Gráfica de barras vertical para datos de temperatura y condiciones climáticas.
 * Muestra: Temperatura (°C), Humedad (%), Tasa de lluvia (mm/h), Lluvia del día (mm).
 *
 * lectura → ClimateReadingDTO (ultimaLecturaClimatica)
 * Conectar desde: GET /api/telemetria/resumen → datos.ultimaLecturaClimatica
 */
function GraficaTemperatura({ lectura }) {
    const data = {
        labels: ['Temperatura (°C)', 'Humedad (%)', 'Tasa de lluvia (mm/h)', 'Lluvia diaria (mm)'],
        datasets: [
            {
                label: 'Valor actual',
                data: [
                    lectura?.temperatura ?? 0,
                    lectura?.humedad      ?? 0,
                    lectura?.rainRate     ?? 0,
                    lectura?.dailyRain    ?? 0,
                ],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.78)',
                    'rgba(23, 102, 130, 0.75)',
                    'rgba(78, 205, 196, 0.80)',
                    'rgba(108, 92, 231, 0.75)',
                ],
                borderColor: ['#FF6B6B', '#176682', '#4ECDC4', '#6C5CE7'],
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Bar data={data} options={OPTIONS} />
        </div>
    );
}

export default GraficaTemperatura;
