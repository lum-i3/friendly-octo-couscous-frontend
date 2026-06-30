import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLOR_SOLAR  = 'rgba(245, 166, 35, 0.85)';
const COLOR_EOLICO = 'rgba(78, 205, 196, 0.85)';
const COLOR_VACIO  = '#D8E7E9';

const OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
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
                label: (ctx) => ` ${ctx.raw.toFixed(2)} kWh`,
            },
        },
    },
};

/**
 * Compara la energía generada por el sistema solar y el eólico.
 * solar  → ElectricReadingDTO con fuente FOTOVOLTAICO
 * eolica → ElectricReadingDTO con fuente EOLICO
 */
function ChartEnergiaComparativa({ solar, eolica }) {
    const energiaSolar  = solar?.energia  ?? 0;
    const energiaEolica = eolica?.energia ?? 0;
    const sinDatos = energiaSolar === 0 && energiaEolica === 0;

    const data = {
        labels: ['Solar (kWh)', 'Eólica (kWh)'],
        datasets: [{
            data: sinDatos ? [1, 1] : [energiaSolar, energiaEolica],
            backgroundColor: sinDatos
                ? [COLOR_VACIO, COLOR_VACIO]
                : [COLOR_SOLAR, COLOR_EOLICO],
            borderColor: sinDatos
                ? ['#c3d7da', '#c3d7da']
                : ['#F5A623', '#4ECDC4'],
            borderWidth: 1.5,
        }],
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Doughnut data={data} options={OPTIONS} />
        </div>
    );
}

export default ChartEnergiaComparativa;
