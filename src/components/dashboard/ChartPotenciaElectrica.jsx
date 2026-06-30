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
            position: 'top',
            labels: {
                font: { size: 12, family: "'Inter', system-ui, sans-serif" },
                padding: 16,
                boxWidth: 14,
            },
        },
        tooltip: {
            callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`,
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
            grid: { color: 'rgba(23,102,130,0.08)' },
            ticks: {
                font: { size: 11, family: "'Inter', system-ui, sans-serif" },
            },
        },
    },
};

/**
 * Gráfica de barras agrupadas con voltaje, corriente, potencia y energía
 * para ambas fuentes de generación eléctrica.
 * solar  → ElectricReadingDTO (FOTOVOLTAICO)
 * eolica → ElectricReadingDTO (EOLICO)
 */
function ChartPotenciaElectrica({ solar, eolica }) {
    const data = {
        labels: ['Voltaje (V)', 'Corriente (A)', 'Potencia (W)', 'Energía (kWh)'],
        datasets: [
            {
                label: 'Solar (Fotovoltaico)',
                data: [
                    solar?.voltaje   ?? 0,
                    solar?.corriente ?? 0,
                    solar?.potencia  ?? 0,
                    solar?.energia   ?? 0,
                ],
                backgroundColor: 'rgba(245, 166, 35, 0.80)',
                borderColor: '#F5A623',
                borderWidth: 1.5,
                borderRadius: 6,
            },
            {
                label: 'Eólico',
                data: [
                    eolica?.voltaje   ?? 0,
                    eolica?.corriente ?? 0,
                    eolica?.potencia  ?? 0,
                    eolica?.energia   ?? 0,
                ],
                backgroundColor: 'rgba(78, 205, 196, 0.80)',
                borderColor: '#4ECDC4',
                borderWidth: 1.5,
                borderRadius: 6,
            },
        ],
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Bar data={data} options={OPTIONS} />
        </div>
    );
}

export default ChartPotenciaElectrica;
