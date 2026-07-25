import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import useUserProfile from '../../hooks/useUserProfile';
import { getAdminItems } from '../../utils/sidebarItems.jsx';
import { getTokenRole } from '../../utils/auth';
import '../../styles/dashboard.css';
import '../../styles/admin.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const FUENTES_RESPALDO = [
    { id: 'CLIMATICO',    label: 'Climático',    colorClass: 'climatico', inProgreso: e => e.climaticoEnProgreso,     fechaMin: e => e.fechaMinClimatica,    endpoint: 'climatico', fuenteParam: null },
    { id: 'FOTOVOLTAICO', label: 'Fotovoltaico', colorClass: 'solar',     inProgreso: e => e.fotovoltaicoEnProgreso, fechaMin: e => e.fechaMinFotovoltaico, endpoint: 'electrico', fuenteParam: 'FOTOVOLTAICO' },
    { id: 'EOLICO',       label: 'Eólico',       colorClass: 'eolico',    inProgreso: e => e.eolicoEnProgreso,       fechaMin: e => e.fechaMinEolico,       endpoint: 'electrico', fuenteParam: 'EOLICO' },
];

function fmtFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function RespaldoAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();
    const esSuperAdmin = getTokenRole() === 'SUPERADMINISTRADOR';

    const [estadoRespaldo, setEstadoRespaldo] = useState(null);
    const [respaldoDesde, setRespaldoDesde] = useState({ CLIMATICO: '', FOTOVOLTAICO: '', EOLICO: '' });
    const [respaldoHasta, setRespaldoHasta] = useState({ CLIMATICO: '', FOTOVOLTAICO: '', EOLICO: '' });
    const [respaldoErr, setRespaldoErr] = useState({ CLIMATICO: '', FOTOVOLTAICO: '', EOLICO: '' });
    const [fechasDetectadas, setFechasDetectadas] = useState(null);
    const [detectandoFechas, setDetectandoFechas] = useState(false);

    const cargarEstadoRespaldo = useCallback(async () => {
        if (!esSuperAdmin) return;
        const token = localStorage.getItem('jwt');
        if (!token) return;
        try {
            const res = await fetch(`${BASE_URL}/api/admin/respaldo-historico/estado`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setEstadoRespaldo(json.datos ?? null);
            }
        } catch { /* silencioso */ }
    }, [esSuperAdmin]);

    useEffect(() => { cargarEstadoRespaldo(); }, [cargarEstadoRespaldo]);

    /* Polling mientras haya un respaldo en progreso */
    useEffect(() => {
        if (!estadoRespaldo) return;
        const anyEnProgreso = estadoRespaldo.climaticoEnProgreso ||
                              estadoRespaldo.fotovoltaicoEnProgreso ||
                              estadoRespaldo.eolicoEnProgreso;
        if (!anyEnProgreso) return;
        const id = setInterval(cargarEstadoRespaldo, 3000);
        return () => clearInterval(id);
    }, [estadoRespaldo?.climaticoEnProgreso, estadoRespaldo?.fotovoltaicoEnProgreso, estadoRespaldo?.eolicoEnProgreso, cargarEstadoRespaldo]);

    const handleDetectarFechas = useCallback(async () => {
        setDetectandoFechas(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch(`${BASE_URL}/api/admin/respaldo-historico/detectar-inicio`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al detectar fechas');
            const d = json.datos;
            setFechasDetectadas({ aw: d.fechaInicioAW, fv: d.fechaInicioFV, eolico: d.fechaInicioEolico });
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error al detectar', text: err.message });
        } finally {
            setDetectandoFechas(false);
        }
    }, []);

    const handleIniciarRespaldo = useCallback(async (fuente) => {
        const { id, endpoint, fuenteParam, label } = fuente;
        const desde = respaldoDesde[id];
        const hasta = respaldoHasta[id];
        if (!desde) {
            setRespaldoErr(e => ({ ...e, [id]: 'La fecha de inicio es requerida.' }));
            return;
        }
        if (hasta && new Date(`${desde}:00`) >= new Date(`${hasta}:00`)) {
            setRespaldoErr(e => ({ ...e, [id]: 'La fecha de inicio debe ser anterior a la fecha de fin.' }));
            return;
        }
        setRespaldoErr(e => ({ ...e, [id]: '' }));

        const { isConfirmed } = await Swal.fire({
            title: `¿Iniciar respaldo ${label.toLowerCase()}?`,
            text: `Se importarán datos desde ${new Date(`${desde}:00`).toLocaleString('es-MX')}. El proceso corre en segundo plano y puede tardar varios minutos.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Iniciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
        });
        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');
        try {
            const params = new URLSearchParams({ desde: `${desde}:00` });
            if (hasta) params.set('hasta', `${hasta}:59`);
            if (fuenteParam) params.set('fuente', fuenteParam);
            const res = await fetch(`${BASE_URL}/api/admin/respaldo-historico/${endpoint}?${params}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje ?? 'Error al iniciar respaldo');
            await Swal.fire({ icon: 'success', title: 'Respaldo iniciado', text: json.mensaje, timer: 3000, showConfirmButton: false });
            cargarEstadoRespaldo();
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
        }
    }, [respaldoDesde, respaldoHasta, cargarEstadoRespaldo]);

    const handleLogout = useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Cerrar sesión?', icon: 'question', showCancelButton: true,
            confirmButtonText: 'Cerrar sesión', cancelButtonText: 'Cancelar',
            confirmButtonColor: '#E94E50', cancelButtonColor: '#176682',
        });
        if (isConfirmed) { localStorage.removeItem('jwt'); navigate('/login', { replace: true }); }
    }, [navigate]);

    const sidebarUser = perfil ? { nombre: perfil.nombreCompleto || perfil.nombreUsuario, foto: perfil.fotoPerfil || null } : null;

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout navItems={getAdminItems()} user={sidebarUser} titulo="Respaldo histórico" actions={headerActions}>

                    {!esSuperAdmin ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: 'Inter, system-ui, sans-serif', color: '#6b7a80' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10475C', marginBottom: 8 }}>Acceso restringido</p>
                            <p style={{ fontSize: '0.88rem' }}>Esta sección es exclusiva para superadministradores.</p>
                        </div>
                    ) : (
                        <div className="admin-tabla-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 12, flexWrap: 'wrap' }}>
                                <h2 className="admin-tabla-titulo" style={{ margin: 0 }}>Respaldo histórico de datos</h2>
                                <button
                                    className="editar-perfil-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem', flexShrink: 0 }}
                                    onClick={handleDetectarFechas}
                                    disabled={detectandoFechas}
                                    title="Consulta las APIs externas para determinar la fecha más antigua disponible en cada fuente (puede tardar ~20 s)"
                                >
                                    {detectandoFechas ? 'Detectando…' : 'Detectar fechas disponibles'}
                                </button>
                            </div>
                            <p className="respaldo-desc">
                                Importa registros históricos anteriores a los que ya existen en la base de datos. Cada fuente corre de forma independiente en segundo plano y solo guarda los registros que falten.
                                {!fechasDetectadas && ' Usa el botón de detección para conocer la fecha más antigua disponible en cada API.'}
                            </p>
                            <div className="respaldo-grid">
                                {FUENTES_RESPALDO.map(f => {
                                    const enProgreso = estadoRespaldo ? f.inProgreso(estadoRespaldo) : false;
                                    const fechaMin   = estadoRespaldo ? f.fechaMin(estadoRespaldo)   : null;
                                    const detectedDate = fechasDetectadas
                                        ? (f.id === 'CLIMATICO' ? fechasDetectadas.aw : f.id === 'FOTOVOLTAICO' ? fechasDetectadas.fv : fechasDetectadas.eolico)
                                        : null;
                                    const minApi = detectedDate;
                                    const desde  = respaldoDesde[f.id];
                                    const showWarn = desde && fechaMin && new Date(`${desde}:00`) >= new Date(fechaMin);
                                    return (
                                        <div key={f.id} className="respaldo-card">
                                            <div className={`respaldo-card__header respaldo-card__header--${f.colorClass}`}>
                                                {f.label}
                                            </div>
                                            <div className="respaldo-card__body">
                                                <div className="respaldo-estado">
                                                    <div className={`respaldo-estado__dot ${enProgreso ? 'respaldo-estado__dot--progreso' : 'respaldo-estado__dot--activo'}`} />
                                                    <span>{enProgreso ? 'Respaldo en progreso…' : 'Sin respaldo activo'}</span>
                                                </div>
                                                <hr className="respaldo-divider" />
                                                <div className="respaldo-info-row">
                                                    <span>Datos en BD desde:</span>
                                                    <strong>{fechaMin ? fmtFecha(fechaMin) : '—'}</strong>
                                                </div>
                                                {minApi && (
                                                    <div className="respaldo-info-row">
                                                        <span>Disponible en API (detectado):</span>
                                                        <strong>{fmtFecha(minApi)}</strong>
                                                    </div>
                                                )}
                                                {!minApi && !detectandoFechas && (
                                                    <div className="respaldo-info-row" style={{ color: '#aab5b8', fontStyle: 'italic' }}>
                                                        <span>Disponible en API:</span>
                                                        <span>Sin detectar</span>
                                                    </div>
                                                )}
                                                {detectandoFechas && (
                                                    <div className="respaldo-info-row" style={{ color: '#aab5b8', fontStyle: 'italic' }}>
                                                        <span>Disponible en API:</span>
                                                        <span>Detectando…</span>
                                                    </div>
                                                )}
                                                <hr className="respaldo-divider" />
                                                <div className="respaldo-field-group">
                                                    <label>Desde <span style={{ color: '#c0392b' }}>*</span></label>
                                                    <input
                                                        type="datetime-local"
                                                        value={desde}
                                                        onChange={e => {
                                                            setRespaldoDesde(m => ({ ...m, [f.id]: e.target.value }));
                                                            if (respaldoErr[f.id]) setRespaldoErr(m => ({ ...m, [f.id]: '' }));
                                                        }}
                                                        min={minApi ? minApi.slice(0, 16) : undefined}
                                                        max={new Date().toISOString().slice(0, 16)}
                                                        disabled={enProgreso}
                                                    />
                                                </div>
                                                <div className="respaldo-field-group">
                                                    <label>Hasta <span style={{ color: '#6b7a80', fontWeight: 400 }}>(opcional, por defecto: ahora)</span></label>
                                                    <input
                                                        type="datetime-local"
                                                        value={respaldoHasta[f.id]}
                                                        onChange={e => setRespaldoHasta(m => ({ ...m, [f.id]: e.target.value }))}
                                                        min={desde || (minApi ? minApi.slice(0, 16) : undefined)}
                                                        max={new Date().toISOString().slice(0, 16)}
                                                        disabled={enProgreso}
                                                    />
                                                </div>
                                                {showWarn && (
                                                    <p className="respaldo-warning">
                                                        Esta fecha ya está dentro del rango almacenado. Solo se importarán los registros que falten.
                                                    </p>
                                                )}
                                                {respaldoErr[f.id] && <p className="respaldo-error">{respaldoErr[f.id]}</p>}
                                                <button
                                                    className="respaldo-btn"
                                                    onClick={() => handleIniciarRespaldo(f)}
                                                    disabled={enProgreso || !estadoRespaldo}
                                                >
                                                    {enProgreso ? 'En progreso…' : 'Iniciar respaldo'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </SidebarLayout>
            </div>
        </div>
    );
}

export default RespaldoAdmin;
