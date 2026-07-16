import { useState } from 'react';
import useEstadisticasClimaticas from '../../hooks/useEstadisticasClimaticas';

const FILTROS = [
    { id: '1h',  label: '1 hora',  dias: 1 / 24 },
    { id: '1d',  label: '1 día',   dias: 1       },
    { id: '7d',  label: '7 días',  dias: 7       },
    { id: '15d', label: '15 días', dias: 15      },
    { id: 'mes', label: '1 mes',   dias: 30      },
];

/* ── Cálculos derivados ── */
function calcDewPoint(T, RH) {
    if (T == null || RH == null) return null;
    const a = 17.27, b = 237.7;
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);
    return (b * alpha) / (a - alpha);
}

function calcFeelsLike(T, vms) {
    if (T == null) return null;
    const V = (vms ?? 0) * 3.6;
    if (T <= 10 && V >= 4.8) {
        return 13.12 + 0.6215 * T
             - 11.37 * Math.pow(V, 0.16)
             + 0.3965 * T * Math.pow(V, 0.16);
    }
    return T;
}

/* ── Formateo ── */
function fmt(v, decimales = 1, unidad = '°C') {
    return v != null ? `${Number(v).toFixed(decimales)} ${unidad}` : '—';
}

function fmtHL(max, min, unidad = '°C') {
    if (max == null && min == null) return '—';
    const hi = max != null ? Number(max).toFixed(1) : '—';
    const lo = min != null ? Number(min).toFixed(1) : '—';
    return `${hi} / ${lo} ${unidad}`;
}

/* ── Fila de la tabla ── */
function Fila({ label, valor, extra = '' }) {
    return (
        <div className="tabla-climatica__fila">
            <span className="tabla-climatica__label">{label}</span>
            <span className={`tabla-climatica__valor ${extra}`}>{valor}</span>
        </div>
    );
}

function TablaClimatica({ clima }) {
    const [filtro, setFiltro] = useState('1d');
    const diasActual = FILTROS.find(f => f.id === filtro).dias;
    const { stats, cargando } = useEstadisticasClimaticas(diasActual);

    const T  = clima?.temperatura;
    const RH = clima?.humedad;
    const V  = clima?.viento;

    const dew = calcDewPoint(T, RH);
    const fl  = calcFeelsLike(T, V);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>

            {/* Chips de filtro */}
            <div className="tabla-filtro-row">
                {FILTROS.map(f => (
                    <button
                        key={f.id}
                        type="button"
                        className={`tabla-filtro-chip${filtro === f.id ? ' tabla-filtro-chip--activo' : ''}`}
                        onClick={() => setFiltro(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {cargando ? (
                <div className="dashboard-skeleton" style={{ minHeight: 140 }} />
            ) : (
                <div className="tabla-climatica">

                    {/* ── Exterior ── */}
                    <div className="tabla-climatica__seccion">
                        <div className="tabla-climatica__header">Exterior</div>
                        <Fila label="Temperatura"       valor={fmt(T)} />
                        <Fila label="Punto de rocío"    valor={fmt(dew)} />
                        <Fila label="Sensación térmica" valor={fmt(fl)} />
                        <Fila label="Humedad actual"    valor={fmt(RH, 0, '%')} />
                        <Fila label="Temp. Máx / Mín"  valor={fmtHL(stats?.maxTemperatura, stats?.minTemperatura)} />
                        <Fila label="Temp. promedio"    valor={fmt(stats?.promedioTemperatura)} />
                        <Fila label="Humedad Máx / Mín" valor={fmtHL(stats?.maxHumedad, stats?.minHumedad, '%')} />
                        <Fila label="Humedad promedio"  valor={fmt(stats?.promedioHumedad, 0, '%')} />
                    </div>

                    {/* ── Viento ── */}
                    <div className="tabla-climatica__seccion">
                        <div className="tabla-climatica__header">Viento y Radiación</div>
                        <Fila label="Velocidad actual"   valor={fmt(V, 1, 'm/s')} />
                        <Fila label="Ráfaga máxima"      valor={fmt(stats?.maxViento, 1, 'm/s')} />
                        <Fila label="Vel. promedio"       valor={fmt(stats?.promedioViento, 1, 'm/s')} />
                        <Fila label="Radiación actual"    valor={fmt(clima?.radiacion, 0, 'W/m²')} />
                        <Fila label="Radiación máx."      valor={fmt(stats?.maxRadiacion, 0, 'W/m²')} />
                        <Fila label="Radiación prom."     valor={fmt(stats?.promedioRadiacion, 0, 'W/m²')} />
                        <Fila label="Presión promedio"    valor={fmt(stats?.promedioPresion, 1, 'hPa')} />
                    </div>

                </div>
            )}
        </div>
    );
}

export default TablaClimatica;
