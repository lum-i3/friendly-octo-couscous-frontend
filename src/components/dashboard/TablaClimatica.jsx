import { useState } from 'react';
import useEstadisticasClimaticas from '../../hooks/useEstadisticasClimaticas';

const FILTROS = [
    { id: '1h',  label: '1 hora',  dias: 1 / 24 },
    { id: '1d',  label: '1 día',   dias: 1       },
    { id: '7d',  label: '7 días',  dias: 7       },
    { id: '15d', label: '15 días', dias: 15      },
    { id: 'mes', label: '1 mes',   dias: 30      },
];

/* ── Cálculos derivados (solo para lectura actual) ── */
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

function fmt(v, dec = 1, unit = '°C') {
    if (v == null) return null;
    return <><strong>{Number(v).toFixed(dec)}</strong><span className="resumen-tabla__unit">{unit}</span></>;
}

function Cell({ v, variant }) {
    const cls = `resumen-tabla__cell${variant ? ` resumen-tabla__cell--${variant}` : ''}`;
    return (
        <div className={cls}>
            {v ?? <span className="resumen-tabla__dash">—</span>}
        </div>
    );
}

function labelPeriodo(id) {
    return FILTROS.find(f => f.id === id)?.label ?? '';
}

function TablaClimatica({ clima }) {
    const [filtro, setFiltro] = useState('1d');
    const diasActual = FILTROS.find(f => f.id === filtro).dias;
    const { stats, cargando } = useEstadisticasClimaticas(diasActual);

    const T  = clima?.temperatura;
    const RH = clima?.humedad;
    const V  = clima?.viento;

    return (
        <div className="resumen-tabla-wrapper">

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
                <>
                    {/* ── Tabla 1: Temperatura y Humedad ── */}
                    <p className="resumen-tabla__titulo">Temperatura y Humedad — {labelPeriodo(filtro)}</p>
                    <div className="resumen-tabla resumen-tabla--cols2">
                        <div className="resumen-tabla__header-row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--label" />
                            <div className="resumen-tabla__cell resumen-tabla__cell--col-header">Temperatura</div>
                            <div className="resumen-tabla__cell resumen-tabla__cell--col-header">Humedad</div>
                        </div>
                        <div className="resumen-tabla__row resumen-tabla__row--actual">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Actual</div>
                            <Cell v={fmt(T)} />
                            <Cell v={fmt(RH, 0, '%')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Promedio</div>
                            <Cell v={fmt(stats?.promedioTemperatura)} />
                            <Cell v={fmt(stats?.promedioHumedad, 0, '%')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Máxima</div>
                            <Cell v={fmt(stats?.maxTemperatura)} variant="high" />
                            <Cell v={fmt(stats?.maxHumedad, 0, '%')} variant="high" />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Mínima</div>
                            <Cell v={fmt(stats?.minTemperatura)} variant="low" />
                            <Cell v={fmt(stats?.minHumedad, 0, '%')} variant="low" />
                        </div>
                    </div>

                    {/* ── Tabla 2: Condiciones actuales derivadas ── */}
                    <div className="resumen-tabla__condiciones-row">
                        <div className="resumen-tabla__condicion">
                            <span className="resumen-tabla__condicion-label">Sensación térmica</span>
                            <span className="resumen-tabla__condicion-valor">
                                {calcFeelsLike(T, V) != null
                                    ? <>{Number(calcFeelsLike(T, V)).toFixed(1)} °C</>
                                    : '—'}
                            </span>
                        </div>
                        <div className="resumen-tabla__condicion">
                            <span className="resumen-tabla__condicion-label">Punto de rocío</span>
                            <span className="resumen-tabla__condicion-valor">
                                {calcDewPoint(T, RH) != null
                                    ? <>{Number(calcDewPoint(T, RH)).toFixed(1)} °C</>
                                    : '—'}
                            </span>
                        </div>
                    </div>

                    {/* ── Tabla 3: Viento y Radiación ── */}
                    <p className="resumen-tabla__titulo" style={{ marginTop: 14 }}>Viento y Radiación — {labelPeriodo(filtro)}</p>
                    <div className="resumen-tabla resumen-tabla--cols2">
                        <div className="resumen-tabla__header-row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--label" />
                            <div className="resumen-tabla__cell resumen-tabla__cell--col-header">Viento</div>
                            <div className="resumen-tabla__cell resumen-tabla__cell--col-header">Radiación Solar</div>
                        </div>
                        <div className="resumen-tabla__row resumen-tabla__row--actual">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Actual</div>
                            <Cell v={fmt(V, 1, 'm/s')} />
                            <Cell v={fmt(clima?.radiacion, 0, 'W/m²')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Promedio</div>
                            <Cell v={fmt(stats?.promedioViento, 1, 'm/s')} />
                            <Cell v={fmt(stats?.promedioRadiacion, 0, 'W/m²')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Máxima</div>
                            <Cell v={fmt(stats?.maxViento, 1, 'm/s')} variant="high" />
                            <Cell v={fmt(stats?.maxRadiacion, 0, 'W/m²')} variant="high" />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Mínima</div>
                            <Cell v={fmt(stats?.minViento, 1, 'm/s')} variant="low" />
                            <Cell v={fmt(stats?.minRadiacion, 0, 'W/m²')} variant="low" />
                        </div>
                    </div>

                    {/* ── Presión atmosférica ── */}
                    <p className="resumen-tabla__titulo" style={{ marginTop: 14 }}>Presión Atmosférica — {labelPeriodo(filtro)}</p>
                    <div className="resumen-tabla resumen-tabla--cols1">
                        <div className="resumen-tabla__header-row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--label" />
                            <div className="resumen-tabla__cell resumen-tabla__cell--col-header">Presión</div>
                        </div>
                        <div className="resumen-tabla__row resumen-tabla__row--actual">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Actual</div>
                            <Cell v={fmt(clima?.presion, 1, 'hPa')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Promedio</div>
                            <Cell v={fmt(stats?.promedioPresion, 1, 'hPa')} />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Máxima</div>
                            <Cell v={fmt(stats?.maxPresion, 1, 'hPa')} variant="high" />
                        </div>
                        <div className="resumen-tabla__row">
                            <div className="resumen-tabla__cell resumen-tabla__cell--row-label">Mínima</div>
                            <Cell v={fmt(stats?.minPresion, 1, 'hPa')} variant="low" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default TablaClimatica;
