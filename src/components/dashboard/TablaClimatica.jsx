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

function fmtDelta(v) {
    if (v == null) return { texto: '—', clase: '' };
    const texto = (v >= 0 ? '+' : '') + Number(v).toFixed(1) + ' °C';
    const clase = v >= 0 ? 'tabla-climatica__valor--pos' : 'tabla-climatica__valor--neg';
    return { texto, clase };
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

function TablaClimatica({ clima, resumen, cargando }) {
    if (cargando) return <div className="dashboard-skeleton" />;

    const T   = clima?.temperatura;
    const RH  = clima?.humedad;
    const V   = clima?.viento;

    const dew   = calcDewPoint(T, RH);
    const fl    = calcFeelsLike(T, V);
    const delta = (T != null && resumen?.ayer?.promedioTemperatura != null)
        ? T - resumen.ayer.promedioTemperatura
        : null;
    const { texto: deltaTexto, clase: deltaClase } = fmtDelta(delta);

    const { hoy, ayer, semana, mes, anio } = resumen ?? {};

    return (
        <div className="tabla-climatica">

            {/* ── Exterior ── */}
            <div className="tabla-climatica__seccion">
                <div className="tabla-climatica__header">Exterior</div>
                <Fila label="Temperatura"       valor={fmt(T)} />
                <Fila label="Punto de rocío"    valor={fmt(dew)} />
                <Fila label="Vs. ayer"          valor={deltaTexto} extra={deltaClase} />
                <Fila label="Sensación térmica" valor={fmt(fl)} />
                <Fila label="Hoy Máx / Mín"    valor={fmtHL(hoy?.maxTemperatura, hoy?.minTemperatura)} />
                <Fila label="Ayer Máx / Mín"   valor={fmtHL(ayer?.maxTemperatura, ayer?.minTemperatura)} />
                <Fila label="Semanal Máx / Mín" valor={fmtHL(semana?.maxTemperatura, semana?.minTemperatura)} />
                <Fila label="Mensual Máx / Mín" valor={fmtHL(mes?.maxTemperatura, mes?.minTemperatura)} />
                <Fila label="Anual Máx / Mín"  valor={fmtHL(anio?.maxTemperatura, anio?.minTemperatura)} />
            </div>

            {/* ── Viento ── */}
            <div className="tabla-climatica__seccion">
                <div className="tabla-climatica__header">Viento</div>
                <Fila label="Velocidad actual"   valor={fmt(V, 1, 'm/s')} />
                <Fila label="Ráfaga máx. hoy"   valor={fmt(hoy?.maxViento, 1, 'm/s')} />
                <Fila label="Promedio semanal"   valor={fmt(semana?.promedioViento, 1, 'm/s')} />
                <Fila label="Ráfaga máx. semana" valor={fmt(semana?.maxViento, 1, 'm/s')} />
                <Fila label="Promedio mensual"   valor={fmt(mes?.promedioViento, 1, 'm/s')} />
                <Fila label="Ráfaga máx. mes"    valor={fmt(mes?.maxViento, 1, 'm/s')} />
            </div>

        </div>
    );
}

export default TablaClimatica;
