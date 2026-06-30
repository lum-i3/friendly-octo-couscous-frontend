import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import '../../styles/dashboard.css';

ChartJS.register(ArcElement, Tooltip);

const TEMP_MAX = 50;  // escala máxima en °C
const HUM_MAX  = 100; // escala máxima en %

const BASE_OPTIONS = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    rotation: -90,
    circumference: 180,
    cutout: '68%',
    plugins: {
        legend:  { display: false },
        tooltip: { enabled: false },
    },
};

function Gauge({ valor, maximo, color, etiqueta, unidad }) {
    const v = valor != null ? Math.min(Math.max(Number(valor), 0), maximo) : 0;

    const data = {
        datasets: [{
            data: [v, maximo - v],
            backgroundColor: [color, '#E0ECEF'],
            borderWidth: 0,
        }],
    };

    return (
        <div className="dashboard-gauge">
            <div className="dashboard-gauge__canvas-wrapper">
                <Doughnut data={data} options={BASE_OPTIONS} />
                <span className="dashboard-gauge__value">
                    {valor != null ? `${valor}${unidad}` : '--'}
                </span>
            </div>
            <span className="dashboard-gauge__label">{etiqueta}</span>
        </div>
    );
}

/**
 * Muestra temperatura y humedad como gauges de semicírculo.
 * lectura → ClimateReadingDTO (ultimaLecturaClimatica)
 */
function ChartTemperaturaHumedad({ lectura }) {
    return (
        <div className="dashboard-gauges-row">
            <Gauge
                valor={lectura?.temperatura}
                maximo={TEMP_MAX}
                color="#FF6B6B"
                etiqueta="Temperatura"
                unidad="°C"
            />
            <Gauge
                valor={lectura?.humedad}
                maximo={HUM_MAX}
                color="#176682"
                etiqueta="Humedad"
                unidad="%"
            />
        </div>
    );
}

export default ChartTemperaturaHumedad;
