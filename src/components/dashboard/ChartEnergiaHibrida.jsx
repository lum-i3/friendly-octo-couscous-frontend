import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import '../../styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const OPTIONS = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => ` ${Number(ctx.raw).toFixed(3)} kWh`,
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: { color: 'rgba(23,102,130,0.08)' },
            ticks: {
                font: { size: 10, family: "'Inter', system-ui, sans-serif" },
                callback: (v) => `${v} kWh`,
            },
        },
        y: {
            grid: { display: false },
            ticks: {
                font: { size: 12, family: "'Inter', system-ui, sans-serif", weight: '600' },
            },
        },
    },
};

function StatMini({ label, value, unit, colorClass }) {
    return (
        <div className="energia-hibrida-stat">
            <span className="energia-hibrida-stat__label">{label}</span>
            <span className={`energia-hibrida-stat__value ${colorClass ?? ''}`}>
                {value != null ? `${Number(value).toFixed(2)} ${unit}` : '—'}
            </span>
        </div>
    );
}

function ChartEnergiaHibrida({ stats }) {
    const energiaSolar  = stats?.fotovoltaico?.energiaTotalPeriodo ?? 0;
    const energiaEolica = stats?.eolico?.energiaTotalPeriodo       ?? 0;
    const potenciaSolar  = stats?.fotovoltaico?.promedioPotencia   ?? null;
    const potenciaEolica = stats?.eolico?.promedioPotencia         ?? null;
    const energiaTotal  = stats?.energiaTotalCombinada             ?? null;
    const potenciaTotal = stats?.potenciaPromedioCombinada         ?? null;

    const data = {
        labels: ['Fotovoltaico', 'Eólico'],
        datasets: [{
            label: 'Energía generada (kWh)',
            data: [energiaSolar, energiaEolica],
            backgroundColor: ['rgba(245,166,35,0.85)', 'rgba(78,205,196,0.85)'],
            borderColor: ['#F5A623', '#4ECDC4'],
            borderWidth: 1.5,
            borderRadius: 6,
        }],
    };

    return (
        <div className="energia-hibrida-wrapper">
            <div className="energia-hibrida-chart">
                <Bar data={data} options={OPTIONS} />
            </div>
            <div className="energia-hibrida-stats">
                <StatMini label="Solar · Energía"   value={energiaSolar}   unit="kWh" colorClass="energia-hibrida-stat__value--solar" />
                <StatMini label="Eólico · Energía"  value={energiaEolica}  unit="kWh" colorClass="energia-hibrida-stat__value--eolico" />
                <StatMini label="Solar · Potencia"  value={potenciaSolar}  unit="W"  colorClass="energia-hibrida-stat__value--solar" />
                <StatMini label="Eólico · Potencia" value={potenciaEolica} unit="W"  colorClass="energia-hibrida-stat__value--eolico" />
                <StatMini label="Total sistema"     value={energiaTotal}   unit="kWh" />
                <StatMini label="Potencia combinada" value={potenciaTotal}  unit="W" />
            </div>
        </div>
    );
}

export default ChartEnergiaHibrida;
