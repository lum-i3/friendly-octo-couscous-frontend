import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── helpers ─────────────────────────────────────────────────────────── */
function toISO(date) {
    return date.toISOString().slice(0, 19);
}

function toDateInput(isoStr) {
    // "2026-07-21T10:30:00" → "2026-07-21"
    return isoStr ? isoStr.slice(0, 10) : '';
}

function fromDateInput(dateStr, endOfDay = false) {
    // "2026-07-21" → Date (local time)
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (endOfDay) { dt.setHours(23, 59, 59); }
    return dt;
}

function formatDisplay(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ytdInicio() {
    const d = new Date();
    return new Date(d.getFullYear(), 0, 1);
}

/* ─── presets ─────────────────────────────────────────────────────────── */
const PRESETS = [
    { id: '24h',    label: 'Últimas 24 horas', dias: 1 },
    { id: '7d',     label: 'Últimos 7 días',   dias: 7 },
    { id: '30d',    label: 'Últimos 30 días',  dias: 30 },
    { id: '90d',    label: 'Últimos 90 días',  dias: 90 },
    { id: '365d',   label: 'Último año',       dias: 365 },
    { id: 'ytd',    label: 'Año a la fecha',   dias: null },
    { id: 'custom', label: 'Personalizado',    dias: null },
];

function calcPreset(preset) {
    const fin = new Date();
    if (preset.id === 'ytd') {
        return { inicio: ytdInicio(), fin };
    }
    const inicio = new Date(fin.getTime() - preset.dias * 86400000);
    return { inicio, fin };
}

/* ─── component ───────────────────────────────────────────────────────── */
function FiltroFechasGrafica({ inicioISO, finISO, onChange }) {
    const [abierto, setAbierto] = useState(false);
    const [presetActivo, setPresetActivo] = useState('24h');
    const [customInicio, setCustomInicio] = useState('');
    const [customFin, setCustomFin] = useState('');
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const aplicarPreset = useCallback((preset) => {
        if (preset.id === 'custom') {
            setPresetActivo('custom');
            setCustomInicio(toDateInput(inicioISO));
            setCustomFin(toDateInput(finISO));
            return;
        }
        const { inicio, fin } = calcPreset(preset);
        setPresetActivo(preset.id);
        onChange(toISO(inicio), toISO(fin));
        setAbierto(false);
    }, [inicioISO, finISO, onChange]);

    function aplicarCustom() {
        const inicio = fromDateInput(customInicio, false);
        const fin    = fromDateInput(customFin, true);
        if (!inicio || !fin || inicio >= fin) return;
        onChange(toISO(inicio), toISO(fin));
        setPresetActivo('custom');
        setAbierto(false);
    }

    const todayISO = new Date().toISOString().slice(0, 10);

    return (
        <div className="filtro-fechas" ref={ref}>
            <button
                type="button"
                className="filtro-fechas__toggle"
                onClick={() => setAbierto(a => !a)}
                aria-expanded={abierto}
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span>{formatDisplay(inicioISO)} – {formatDisplay(finISO)}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
                     style={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {abierto && (
                <div className="filtro-fechas__panel">
                    <div className="filtro-fechas__presets">
                        {PRESETS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`filtro-fechas__preset${presetActivo === p.id ? ' filtro-fechas__preset--activo' : ''}`}
                                onClick={() => aplicarPreset(p)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {presetActivo === 'custom' && (
                        <div className="filtro-fechas__custom">
                            <div className="filtro-fechas__custom-row">
                                <label className="filtro-fechas__custom-label">Desde</label>
                                <input
                                    type="date"
                                    className="filtro-fechas__date-input"
                                    value={customInicio}
                                    max={customFin || todayISO}
                                    onChange={e => setCustomInicio(e.target.value)}
                                />
                            </div>
                            <div className="filtro-fechas__custom-row">
                                <label className="filtro-fechas__custom-label">Hasta</label>
                                <input
                                    type="date"
                                    className="filtro-fechas__date-input"
                                    value={customFin}
                                    min={customInicio}
                                    max={todayISO}
                                    onChange={e => setCustomFin(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className="filtro-fechas__aplicar"
                                disabled={!customInicio || !customFin || customInicio >= customFin}
                                onClick={aplicarCustom}
                            >
                                Aplicar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FiltroFechasGrafica;
