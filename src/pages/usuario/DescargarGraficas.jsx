import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, LineController,
    BarElement, BarController,
    Tooltip, Legend, Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import FormInput from '../../components/FormInput';
import FormTextarea from '../../components/FormTextarea';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import { REGEX_NOMBRE } from '../../utils/validaciones';
import DenegadoIcon from '../../assets/Icons/DenegadoIcon.png';
import '../../styles/descargar.css';

ChartJS.register(
    CategoryScale, LinearScale,
    PointElement, LineElement, LineController,
    BarElement, BarController,
    Tooltip, Legend, Filler,
);

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/* ── Constantes de variables ─────────────────────────────────── */
const VARS_CLIMATICO = ['TEMPERATURA', 'VIENTO', 'HUMEDAD', 'RADIACION', 'PRESION'];
const VARS_ELECTRICO = ['VOLTAJE', 'CORRIENTE', 'POTENCIA', 'VOC', 'ENERGIA'];

const VAR_COLOR = {
    TEMPERATURA: '#E05050', VIENTO: '#176682', HUMEDAD: '#1BB6A5',
    RADIACION: '#FF8C00',   PRESION: '#8B5CF6',
    VOLTAJE:   '#176682',   CORRIENTE: '#E05050', POTENCIA: '#1BB6A5',
    VOC: '#FF8C00',         ENERGIA: '#8B5CF6',
};

const VAR_LABEL = {
    TEMPERATURA: 'Temperatura (°C)', VIENTO: 'Viento (m/s)',
    HUMEDAD:     'Humedad (%)',       RADIACION: 'Radiación (W/m²)', PRESION: 'Presión (hPa)',
    VOLTAJE:     'Voltaje (V)',       CORRIENTE: 'Corriente (A)',
    POTENCIA:    'Potencia (W)',      VOC: 'Voc (V)',                ENERGIA: 'Energía (Wh)',
};

const VAR_FIELD = {
    TEMPERATURA: 'temperatura', VIENTO: 'viento', HUMEDAD: 'humedad',
    RADIACION:   'radiacion',   PRESION: 'presion',
    VOLTAJE:     'voltaje',     CORRIENTE: 'corriente', POTENCIA: 'potencia',
    VOC:         'voc',         ENERGIA: 'energia',
};

/* Campos stats climáticas del endpoint /api/estadisticas/climatica */
const STATS_CLIMA = {
    TEMPERATURA: { PROMEDIO: 'promedioTemperatura', MAXIMO: 'maxTemperatura', MINIMO: 'minTemperatura' },
    VIENTO:      { PROMEDIO: 'promedioViento',       MAXIMO: 'maxViento',       MINIMO: 'minViento' },
    HUMEDAD:     { PROMEDIO: 'promedioHumedad',       MAXIMO: 'maxHumedad',      MINIMO: 'minHumedad' },
    RADIACION:   { PROMEDIO: 'promedioRadiacion',     MAXIMO: 'maxRadiacion',    MINIMO: 'minRadiacion' },
    PRESION:     { PROMEDIO: 'promedioPresion',       MAXIMO: 'maxPresion',      MINIMO: 'minPresion' },
};

/* Campos stats eléctricas del endpoint /api/estadisticas/electrica */
const STATS_ELEC = {
    VOLTAJE:   { PROMEDIO: 'promedioVoltaje',   MAXIMO: 'maxVoltaje',   MINIMO: 'minVoltaje' },
    CORRIENTE: { PROMEDIO: 'promedioCorriente', MAXIMO: 'maxCorriente', MINIMO: 'minCorriente' },
    POTENCIA:  { PROMEDIO: 'promedioPotencia',  MAXIMO: 'maxPotencia',  MINIMO: 'minPotencia' },
    VOC:       { PROMEDIO: 'promedioVoc',       MAXIMO: 'maxVoc',       MINIMO: 'minVoc' },
    ENERGIA:   { PROMEDIO: 'promedioEnergia',   MAXIMO: 'maxEnergia',   MINIMO: 'minEnergia' },
};

const STAT_DASH  = { PROMEDIO: [5, 4], MAXIMO: [2, 3], MINIMO: [8, 4] };
const STAT_LABEL = { PROMEDIO: 'Prom', MAXIMO: 'Máx', MINIMO: 'Mín' };

function fmtFecha(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} `
         + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ── Sub-components ─────────────────────────────────────────── */

function CampoReadOnly({ label, value, required }) {
    return (
        <div className="field" style={{ marginBottom: 14 }}>
            <div className="field-label-row">
                <label className="field-label">
                    {label}{required && <span className="field-required"> *</span>}
                </label>
            </div>
            <input type="text" value={value} readOnly className="field-input" onChange={() => {}} />
        </div>
    );
}

function RadioOpcion({ value, checked, onChange, label }) {
    return (
        <label className="descargar-radio-label">
            <input type="radio" value={value} checked={checked} onChange={onChange} />
            {label}
        </label>
    );
}

function CheckOpcion({ value, checked, onChange, label, color }) {
    return (
        <label className="descargar-check-label">
            <input type="checkbox" value={value} checked={checked} onChange={onChange} />
            {color && <span className="descargar-check-dot" style={{ background: color }} />}
            {label}
        </label>
    );
}

/* ══════════════════════════════════════════════════════════════ */

function DescargarGraficas() {
    const navigate = useNavigate();
    const { perfil, cargando } = useUserProfile();

    /* ── Estado formulario solicitud ─────────────────────── */
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const [nombreCompleto, setNombreCompleto]       = useState('');
    const [motivo, setMotivo]                       = useState('');
    const [errNombre, setErrNombre]                 = useState('');
    const [errMotivo, setErrMotivo]                 = useState('');
    const [enviando, setEnviando]                   = useState(false);

    /* ── Estado descarga ─────────────────────────────────── */
    const [tipo, setTipo]       = useState('CLIMATICO');
    const [fuente, setFuente]   = useState('FOTOVOLTAICO');
    const [formato, setFormato] = useState('XLSX');
    const [inicio, setInicio]   = useState('');
    const [fin, setFin]         = useState('');
    const [errFechas, setErrFechas] = useState('');

    /* Variables seleccionadas (Set) */
    const [variables, setVariables]   = useState(new Set(VARS_CLIMATICO));
    const [tipoGrafica, setTipoGrafica] = useState('LINEA');
    const [estadisticas, setEstadisticas] = useState(new Set(['PROMEDIO', 'MAXIMO', 'MINIMO']));
    const [estadOpen, setEstadOpen]   = useState(false);

    /* ── Estado preview ──────────────────────────────────── */
    const [previewDatos, setPreviewDatos]   = useState([]);
    const [previewStats, setPreviewStats]   = useState(null);
    const [cargandoPreview, setCargandoPreview] = useState(false);
    const [previewError, setPreviewError]   = useState('');

    /* ── Fechas mínimas disponibles ──────────────────────── */
    const [fechasMin, setFechasMin] = useState(null);

    const [descargando, setDescargando] = useState(false);

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    const perfilTieneNombre = Boolean(perfil?.nombreCompleto?.trim());
    const varsActuales = tipo === 'CLIMATICO' ? VARS_CLIMATICO : VARS_ELECTRICO;

    /* ── Cargar fechas mínimas al montar ─────────────────── */
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;
        fetch(`${BASE_URL}/api/estadisticas/fechas`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(j => { if (j.exitoso) setFechasMin(j.datos); })
            .catch(() => {});
    }, []);

    /* Fecha mínima según tipo/fuente para el datetime-local picker (slice a HH:MM) */
    const fechaMinRaw = fechasMin
        ? tipo === 'CLIMATICO'
            ? fechasMin.climaticaMin
            : fuente === 'FOTOVOLTAICO'
                ? fechasMin.fotovoltaicoMin
                : fechasMin.eolicoMin
        : undefined;
    const fechaMin = fechaMinRaw?.slice(0, 16);
    const fechaMax = fechasMin?.hoy?.slice(0, 16);

    /* ── Fetch vista previa ──────────────────────────────── */
    const fetchPreview = useCallback(async () => {
        if (!inicio || !fin) return;
        if (new Date(inicio) >= new Date(fin)) {
            setErrFechas('La fecha de inicio debe ser anterior a la fecha de fin.');
            return;
        }
        setErrFechas('');
        setCargandoPreview(true);
        setPreviewError('');
        setPreviewDatos([]);
        setPreviewStats(null);

        const token   = localStorage.getItem('jwt');
        const headers = { Authorization: `Bearer ${token}` };
        const iniISO  = encodeURIComponent(`${inicio}:00`);
        const finISO  = encodeURIComponent(`${fin}:59`);

        const telUrl   = tipo === 'CLIMATICO'
            ? `${BASE_URL}/api/telemetria/climatica?inicio=${iniISO}&fin=${finISO}&size=300`
            : `${BASE_URL}/api/telemetria/electrica?inicio=${iniISO}&fin=${finISO}&fuente=${fuente}&size=300`;

        const statsUrl = tipo === 'CLIMATICO'
            ? `${BASE_URL}/api/estadisticas/climatica?inicio=${iniISO}&fin=${finISO}`
            : `${BASE_URL}/api/estadisticas/electrica?inicio=${iniISO}&fin=${finISO}&fuente=${fuente}`;

        try {
            const [telRes, statsRes] = await Promise.allSettled([
                fetch(telUrl,   { headers }),
                fetch(statsUrl, { headers }),
            ]);

            if (telRes.status === 'fulfilled' && telRes.value.ok) {
                const j = await telRes.value.json();
                setPreviewDatos(j.datos?.contenido ?? []);
            }

            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                const j = await statsRes.value.json();
                setPreviewStats(j.datos ?? null);
            }

            const noTel   = telRes.status !== 'fulfilled' || !telRes.value.ok;
            const noStats = statsRes.status !== 'fulfilled' || !statsRes.value.ok;
            if (noTel && noStats) setPreviewError('No hay datos disponibles para el periodo seleccionado.');
        } catch {
            setPreviewError('No se pudo cargar la vista previa.');
        } finally {
            setCargandoPreview(false);
        }
    }, [inicio, fin, tipo, fuente]);

    useEffect(() => {
        if (inicio && fin) fetchPreview();
    }, [fetchPreview]);

    /* ── Chart data (memoizado) ──────────────────────────── */
    const chartData = useMemo(() => {
        const activeVars = varsActuales.filter(v => variables.has(v));
        if (activeVars.length === 0) return null;

        const statsMap = tipo === 'CLIMATICO' ? STATS_CLIMA : STATS_ELEC;

        if (tipoGrafica === 'BARRA') {
            /* Bar: Prom/Max/Min por variable (desde endpoint stats) */
            if (!previewStats) return null;
            const statKeys = ['PROMEDIO', 'MAXIMO', 'MINIMO'].filter(s => estadisticas.has(s));
            if (statKeys.length === 0) return null;

            const BAR_COLORS = { PROMEDIO: '#176682', MAXIMO: '#E05050', MINIMO: '#1BB6A5' };
            const BAR_LABELS = { PROMEDIO: 'Promedio', MAXIMO: 'Máximo', MINIMO: 'Mínimo' };

            return {
                labels: activeVars.map(v => VAR_LABEL[v]),
                datasets: statKeys.map(sk => ({
                    type: 'bar',
                    label: BAR_LABELS[sk],
                    data: activeVars.map(v => {
                        const field = statsMap[v]?.[sk];
                        return field ? (previewStats[field] ?? null) : null;
                    }),
                    backgroundColor: BAR_COLORS[sk] + 'cc',
                    borderColor: BAR_COLORS[sk],
                    borderWidth: 1,
                    borderRadius: 4,
                })),
            };
        }

        /* Line: serie de tiempo por variable */
        if (previewDatos.length === 0) return null;

        const step = Math.max(1, Math.ceil(previewDatos.length / 250));
        const sample = previewDatos.filter((_, i) => i % step === 0);
        const labels  = sample.map(d => fmtFecha(d.fechaLectura));

        const datasets = activeVars.map(v => {
            const color = VAR_COLOR[v];
            return {
                type: 'line',
                label: VAR_LABEL[v],
                data:  sample.map(d => d[VAR_FIELD[v]] ?? null),
                borderColor:     color,
                backgroundColor: color + '22',
                borderWidth: 2,
                pointRadius: sample.length > 80 ? 0 : 3,
                pointHitRadius: 8,
                fill: false,
                tension: 0.25,
            };
        });

        /* Líneas de referencia (solo para la primera variable activa) */
        if (previewStats && activeVars.length > 0) {
            const firstVar = activeVars[0];
            const varStats = statsMap[firstVar];
            if (varStats) {
                const color = VAR_COLOR[firstVar];
                ['PROMEDIO', 'MAXIMO', 'MINIMO'].forEach(sk => {
                    if (!estadisticas.has(sk)) return;
                    const value = previewStats[varStats[sk]];
                    if (value == null) return;
                    datasets.push({
                        type: 'line',
                        label: `${STAT_LABEL[sk]} ${VAR_LABEL[firstVar].split(' ')[0]}`,
                        data: Array(sample.length).fill(value),
                        borderColor: color,
                        borderWidth: 1.5,
                        borderDash: STAT_DASH[sk],
                        pointRadius: 0,
                        fill: false,
                        isStatLine: true,
                    });
                });
            }
        }

        return { labels, datasets };
    }, [previewDatos, previewStats, variables, tipoGrafica, estadisticas, tipo, varsActuales]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    filter: (item, data) => !data.datasets[item.datasetIndex]?.isStatLine,
                    boxWidth: 12,
                    font: { size: 11, family: "'Inter', system-ui, sans-serif" },
                },
            },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y != null ? Number(ctx.parsed.y).toFixed(2) : '—'}`,
                },
            },
        },
        scales: {
            x: { ticks: { maxRotation: 45, maxTicksLimit: 14, font: { size: 10 } } },
            y: { ticks: { font: { size: 10 } } },
        },
    }), []);

    /* ── Helpers UI ──────────────────────────────────────── */
    function toggleVar(v) {
        setVariables(prev => {
            const next = new Set(prev);
            next.has(v) ? next.delete(v) : next.add(v);
            return next;
        });
    }

    function toggleStat(s) {
        setEstadisticas(prev => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
        });
    }

    function handleTipoChange(nuevoTipo) {
        setTipo(nuevoTipo);
        setVariables(new Set(nuevoTipo === 'CLIMATICO' ? VARS_CLIMATICO : VARS_ELECTRICO));
        setPreviewDatos([]);
        setPreviewStats(null);
    }

    function handleLimpiar() {
        setTipo('CLIMATICO');
        setFuente('FOTOVOLTAICO');
        setFormato('XLSX');
        setInicio('');
        setFin('');
        setErrFechas('');
        setVariables(new Set(VARS_CLIMATICO));
        setTipoGrafica('LINEA');
        setEstadisticas(new Set(['PROMEDIO', 'MAXIMO', 'MINIMO']));
        setPreviewDatos([]);
        setPreviewStats(null);
        setPreviewError('');
    }

    /* ── Enviar solicitud ────────────────────────────────── */
    function abrirFormulario() {
        setNombreCompleto(perfil?.nombreCompleto ?? '');
        setMotivo('');
        setErrNombre('');
        setErrMotivo('');
        setFormularioAbierto(true);
    }

    function validarSolicitud() {
        let ok = true;
        if (!perfilTieneNombre) {
            const nc = nombreCompleto.trim();
            if (!nc) { setErrNombre('El nombre completo es requerido'); ok = false; }
            else if (!REGEX_NOMBRE.test(nc)) { setErrNombre('Solo letras y espacios'); ok = false; }
            else if (nc.length > 90) { setErrNombre('Máximo 90 caracteres'); ok = false; }
            else setErrNombre('');
        }
        const mot = motivo.trim();
        if (!mot) { setErrMotivo('El motivo es requerido'); ok = false; }
        else if (mot.length > 255) { setErrMotivo('Máximo 255 caracteres'); ok = false; }
        else setErrMotivo('');
        return ok;
    }

    async function handleEnviarSolicitud(e) {
        e.preventDefault();
        if (!validarSolicitud()) return;
        setEnviando(true);
        try {
            const token = localStorage.getItem('jwt');
            const body  = { motivo: motivo.trim() };
            if (!perfilTieneNombre) body.nombreCompleto = nombreCompleto.trim();
            const res  = await fetch(`${BASE_URL}/api/solicitudes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje || `Error ${res.status}`);
            setFormularioAbierto(false);
            setMotivo('');
            await Swal.fire({ title: '¡Solicitud enviada!', text: json.mensaje || 'Será revisada por un administrador.', icon: 'success', confirmButtonColor: '#176682', confirmButtonText: 'Aceptar' });
        } catch (err) {
            await Swal.fire({ title: 'Error al enviar', text: err.message, icon: 'error', confirmButtonColor: '#176682', confirmButtonText: 'Aceptar' });
        } finally {
            setEnviando(false);
        }
    }

    /* ── Descargar reporte ───────────────────────────────── */
    async function handleDescargar(e) {
        e.preventDefault();

        if (!inicio || !fin) { setErrFechas('Selecciona el rango de fechas.'); return; }
        if (new Date(inicio) >= new Date(fin)) { setErrFechas('La fecha de inicio debe ser anterior a la fecha de fin.'); return; }
        setErrFechas('');

        setDescargando(true);
        try {
            const token  = localStorage.getItem('jwt');
            const params = new URLSearchParams({
                inicio: `${inicio}:00`,
                fin:    `${fin}:59`,
                tipo,
                formato,
            });
            if (tipo === 'ELECTRICO') params.set('fuente', fuente);
            for (const v of variables)    params.append('variables', v);
            for (const s of estadisticas) params.append('estadisticas', s);

            const res = await fetch(`${BASE_URL}/api/reportes/descargar?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.mensaje || `Error ${res.status}`);
            }
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            const ext = formato === 'XLSX' ? 'xlsx' : 'pdf';
            const suf = tipo === 'CLIMATICO' ? 'climatico' : `electrico_${fuente.toLowerCase()}`;
            const sufFechas = `${inicio}_${fin}`.replace(/[T:]/g, '-');
            a.download = `reporte_${suf}_${sufFechas}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            await Swal.fire({ title: 'Error al descargar', text: err.message, icon: 'error', confirmButtonColor: '#176682', confirmButtonText: 'Aceptar' });
        } finally {
            setDescargando(false);
        }
    }

    /* ── Render ──────────────────────────────────────────── */
    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Descargar gráficas"
                    onBack={() => navigate(-1)}
                    onHome={() => navigate('/')}
                >
                    {/* ── Cargando ──────────────────────── */}
                    {cargando && (
                        <div className="descargar-sin-permiso">
                            <div className="descargar-skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
                            <div className="descargar-skeleton" style={{ width: 200, height: 22, marginTop: 8 }} />
                            <div className="descargar-skeleton" style={{ width: 300, height: 16, marginTop: 4 }} />
                        </div>
                    )}

                    {/* ── Con permiso ───────────────────── */}
                    {!cargando && perfil?.tienePermisoDescarga && (
                        <form onSubmit={handleDescargar} className="descargar-layout">

                            {/* ──── Panel de filtros ────── */}
                            <div className="descargar-filtros-panel">
                                <div className="descargar-card">

                                    <p className="descargar-seccion__titulo">Tipo de reporte</p>
                                    <div className="descargar-opciones">
                                        <RadioOpcion value="CLIMATICO" checked={tipo === 'CLIMATICO'} onChange={() => handleTipoChange('CLIMATICO')} label="Climático" />
                                        <RadioOpcion value="ELECTRICO" checked={tipo === 'ELECTRICO'} onChange={() => handleTipoChange('ELECTRICO')} label="Eléctrico" />
                                    </div>

                                    {tipo === 'ELECTRICO' && (
                                        <>
                                            <p className="descargar-seccion__titulo" style={{ marginTop: 14 }}>Fuente</p>
                                            <div className="descargar-opciones">
                                                <RadioOpcion value="FOTOVOLTAICO" checked={fuente === 'FOTOVOLTAICO'} onChange={e => setFuente(e.target.value)} label="Fotovoltaico" />
                                                <RadioOpcion value="EOLICO"       checked={fuente === 'EOLICO'}       onChange={e => setFuente(e.target.value)} label="Eólico" />
                                            </div>
                                        </>
                                    )}

                                    <hr className="descargar-divider" />

                                    <p className="descargar-seccion__titulo">Formato</p>
                                    <div className="descargar-opciones">
                                        <RadioOpcion value="XLSX" checked={formato === 'XLSX'} onChange={e => setFormato(e.target.value)} label="Excel (.xlsx)" />
                                        <RadioOpcion value="PDF"  checked={formato === 'PDF'}  onChange={e => setFormato(e.target.value)} label="PDF" />
                                    </div>

                                    <hr className="descargar-divider" />

                                    <p className="descargar-seccion__titulo">Rango de fechas y hora</p>
                                    <div className="descargar-fecha-row">
                                        <div className="descargar-field-group">
                                            <label htmlFor="d-inicio">Desde</label>
                                            <input
                                                id="d-inicio" type="datetime-local"
                                                value={inicio}
                                                min={fechaMin} max={fin || fechaMax}
                                                onChange={e => { setInicio(e.target.value); setErrFechas(''); }}
                                                required
                                            />
                                        </div>
                                        <div className="descargar-field-group">
                                            <label htmlFor="d-fin">Hasta</label>
                                            <input
                                                id="d-fin" type="datetime-local"
                                                value={fin}
                                                min={inicio || fechaMin} max={fechaMax}
                                                onChange={e => { setFin(e.target.value); setErrFechas(''); }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {errFechas && <p className="descargar-inline-error">{errFechas}</p>}

                                    <hr className="descargar-divider" />

                                    <p className="descargar-seccion__titulo">Variables a incluir</p>
                                    <div className="descargar-check-grid">
                                        {varsActuales.map(v => (
                                            <CheckOpcion
                                                key={v} value={v}
                                                checked={variables.has(v)}
                                                onChange={() => toggleVar(v)}
                                                label={VAR_LABEL[v]}
                                                color={VAR_COLOR[v]}
                                            />
                                        ))}
                                    </div>

                                    <hr className="descargar-divider" />

                                    <p className="descargar-seccion__titulo">Tipo de gráfica (vista previa)</p>
                                    <div className="descargar-opciones">
                                        <RadioOpcion value="LINEA" checked={tipoGrafica === 'LINEA'} onChange={e => setTipoGrafica(e.target.value)} label="Línea" />
                                        <RadioOpcion value="BARRA" checked={tipoGrafica === 'BARRA'} onChange={e => setTipoGrafica(e.target.value)} label="Barras" />
                                    </div>

                                    <hr className="descargar-divider" />

                                    {/* ── Estadísticas avanzadas (desplegable) ── */}
                                    <button
                                        type="button"
                                        className="descargar-colapso-btn"
                                        onClick={() => setEstadOpen(o => !o)}
                                        aria-expanded={estadOpen}
                                    >
                                        Estadísticas avanzadas
                                        <span className={`descargar-colapso-icon ${estadOpen ? 'open' : ''}`}>▾</span>
                                    </button>
                                    {estadOpen && (
                                        <div className="descargar-check-grid" style={{ marginTop: 8 }}>
                                            {['PROMEDIO', 'MAXIMO', 'MINIMO', 'MODA'].map(s => (
                                                <CheckOpcion
                                                    key={s} value={s}
                                                    checked={estadisticas.has(s)}
                                                    onChange={() => toggleStat(s)}
                                                    label={{ PROMEDIO: 'Promedio', MAXIMO: 'Máximo', MINIMO: 'Mínimo', MODA: 'Moda' }[s]}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="descargar-acciones">
                                        <button type="button" className="descargar-btn descargar-btn-secundario" onClick={handleLimpiar}>
                                            Limpiar
                                        </button>
                                        <button type="submit" className="descargar-btn" disabled={descargando}>
                                            {descargando ? 'Descargando…' : 'Descargar'}
                                        </button>
                                    </div>

                                </div>
                            </div>

                            {/* ──── Panel de vista previa ─ */}
                            <div className="descargar-preview-panel">
                                <div className="descargar-card descargar-preview-card">
                                    <p className="descargar-seccion__titulo" style={{ marginBottom: 12 }}>
                                        Vista previa
                                    </p>

                                    {(!inicio || !fin) && !cargandoPreview && (
                                        <div className="descargar-preview-vacio">
                                            <span>Selecciona un rango de fechas para previsualizar los datos.</span>
                                        </div>
                                    )}

                                    {cargandoPreview && (
                                        <div className="descargar-preview-vacio">
                                            <div className="descargar-spinner" />
                                            <span>Cargando vista previa…</span>
                                        </div>
                                    )}

                                    {!cargandoPreview && previewError && (
                                        <div className="descargar-preview-vacio">
                                            <span>{previewError}</span>
                                        </div>
                                    )}

                                    {!cargandoPreview && !previewError && chartData && (
                                        <div className="descargar-chart-wrap">
                                            <Chart
                                                type={tipoGrafica === 'LINEA' ? 'line' : 'bar'}
                                                data={chartData}
                                                options={chartOptions}
                                            />
                                        </div>
                                    )}

                                    {!cargandoPreview && !previewError && !chartData && inicio && fin && (
                                        <div className="descargar-preview-vacio">
                                            <span>Sin datos para mostrar. Verifica el rango de fechas.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </form>
                    )}

                    {/* ── Sin permiso ───────────────────── */}
                    {!cargando && !perfil?.tienePermisoDescarga && (
                        <>
                            <div className="descargar-sin-permiso">
                                <img src={DenegadoIcon} alt="" className="descargar-prohibido-icon" />
                                <h2 className="descargar-sin-permiso__titulo">Acceso restringido</h2>
                                <p className="descargar-sin-permiso__desc">
                                    Lo sentimos, pero actualmente no cuentas con el permiso para descargar gráficas. Necesitas solicitarlo.
                                </p>
                                <button className="descargar-btn" onClick={abrirFormulario} type="button" style={{ marginTop: 8 }}>
                                    Acceder al formulario de solicitud
                                </button>
                            </div>

                            {formularioAbierto && (
                                <div className="descargar-overlay" onClick={e => { if (e.target === e.currentTarget) setFormularioAbierto(false); }}>
                                    <div className="descargar-modal">
                                        <button className="descargar-modal__cerrar" onClick={() => setFormularioAbierto(false)} type="button" aria-label="Cerrar formulario">×</button>
                                        <h3 className="descargar-modal__titulo">Formulario de solicitud</h3>

                                        <form onSubmit={handleEnviarSolicitud} noValidate>
                                            <CampoReadOnly label="Nombre de usuario" value={perfil?.nombreUsuario ?? ''} required />

                                            {perfilTieneNombre ? (
                                                <CampoReadOnly label="Nombre completo" value={perfil.nombreCompleto} required />
                                            ) : (
                                                <FormInput
                                                    label="Nombre completo" name="nombreCompleto"
                                                    value={nombreCompleto}
                                                    onChange={e => { setNombreCompleto(e.target.value); if (errNombre) setErrNombre(''); }}
                                                    onBlur={() => {
                                                        const nc = nombreCompleto.trim();
                                                        if (!nc) setErrNombre('El nombre completo es requerido');
                                                        else if (!REGEX_NOMBRE.test(nc)) setErrNombre('Solo letras y espacios');
                                                        else if (nc.length > 90) setErrNombre('Máximo 90 caracteres');
                                                        else setErrNombre('');
                                                    }}
                                                    required error={errNombre} placeholder="Tu nombre completo"
                                                />
                                            )}

                                            <FormTextarea
                                                label="¿Por qué solicita el permiso?" name="motivo"
                                                value={motivo}
                                                onChange={e => { setMotivo(e.target.value); if (errMotivo) setErrMotivo(''); }}
                                                onBlur={() => {
                                                    const mot = motivo.trim();
                                                    if (!mot) setErrMotivo('El motivo es requerido');
                                                    else if (mot.length > 255) setErrMotivo('Máximo 255 caracteres');
                                                    else setErrMotivo('');
                                                }}
                                                required error={errMotivo} placeholder="Describe el motivo de tu solicitud"
                                                maxLength={255} rows={5}
                                            />

                                            <div className="descargar-modal-footer">
                                                <button type="submit" className="descargar-btn descargar-btn-full" disabled={enviando}>
                                                    {enviando ? 'Enviando…' : 'Enviar solicitud'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </SidebarLayout>
            </div>
        </div>
    );
}

export default DescargarGraficas;
