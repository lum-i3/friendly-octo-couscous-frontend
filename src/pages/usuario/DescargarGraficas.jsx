import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import FormInput from '../../components/FormInput';
import FormTextarea from '../../components/FormTextarea';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import { REGEX_NOMBRE } from '../../utils/validaciones';
import '../../styles/descargar.css';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/* ── Icono SVG de prohibición ────────────────────────────────── */
function ProhibidoIcon() {
    return (
        <svg
            className="descargar-prohibido-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" stroke="#E94E50" strokeWidth="1.8" />
            <line x1="5.05" y1="5.05" x2="18.95" y2="18.95" stroke="#E94E50" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

/* ── Campo de solo lectura para el formulario ────────────────── */
function CampoReadOnly({ label, value, required }) {
    return (
        <div className="field" style={{ marginBottom: 14 }}>
            <div className="field-label-row">
                <label className="field-label">
                    {label}{required && <span className="field-required"> *</span>}
                </label>
            </div>
            <input
                type="text"
                value={value}
                readOnly
                className="field-input"
                onChange={() => {}}
            />
        </div>
    );
}

/* ── Opción de radio con etiqueta ────────────────────────────── */
function RadioOpcion({ value, checked, onChange, label }) {
    return (
        <label className="descargar-radio-label">
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={onChange}
            />
            {label}
        </label>
    );
}

/* ══════════════════════════════════════════════════════════════ */

function DescargarGraficas() {
    const navigate = useNavigate();
    const { perfil, cargando } = useUserProfile();

    /* Estado del formulario de solicitud */
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const [nombreCompleto, setNombreCompleto]       = useState('');
    const [motivo, setMotivo]                       = useState('');
    const [errNombre, setErrNombre]                 = useState('');
    const [errMotivo, setErrMotivo]                 = useState('');
    const [enviando, setEnviando]                   = useState(false);

    /* Estado del formulario de descarga */
    const [tipo, setTipo]       = useState('CLIMATICO');
    const [fuente, setFuente]   = useState('FOTOVOLTAICO');
    const [formato, setFormato] = useState('XLSX');
    const [inicio, setInicio]   = useState('');
    const [fin, setFin]         = useState('');
    const [descargando, setDescargando] = useState(false);

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    const perfilTieneNombre = Boolean(perfil?.nombreCompleto?.trim());

    /* ── Abrir formulario de solicitud ─────────────────────── */
    function abrirFormulario() {
        setNombreCompleto(perfil?.nombreCompleto ?? '');
        setMotivo('');
        setErrNombre('');
        setErrMotivo('');
        setFormularioAbierto(true);
    }

    /* ── Validar solicitud ──────────────────────────────────── */
    function validarSolicitud() {
        let valido = true;

        if (!perfilTieneNombre) {
            const nc = nombreCompleto.trim();
            if (!nc) {
                setErrNombre('El nombre completo es requerido');
                valido = false;
            } else if (!REGEX_NOMBRE.test(nc)) {
                setErrNombre('Solo letras y espacios');
                valido = false;
            } else if (nc.length > 90) {
                setErrNombre('Máximo 90 caracteres');
                valido = false;
            } else {
                setErrNombre('');
            }
        }

        const mot = motivo.trim();
        if (!mot) {
            setErrMotivo('El motivo es requerido');
            valido = false;
        } else if (mot.length > 255) {
            setErrMotivo('Máximo 255 caracteres');
            valido = false;
        } else {
            setErrMotivo('');
        }

        return valido;
    }

    /* ── Enviar solicitud de permiso ────────────────────────── */
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.mensaje || `Error ${res.status}`);

            setFormularioAbierto(false);
            setMotivo('');
            await Swal.fire({
                title: '¡Solicitud enviada!',
                text: json.mensaje || 'Tu solicitud será revisada por un administrador.',
                icon: 'success',
                confirmButtonColor: '#176682',
                confirmButtonText: 'Aceptar',
            });
        } catch (err) {
            await Swal.fire({
                title: 'Error al enviar',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#176682',
                confirmButtonText: 'Aceptar',
            });
        } finally {
            setEnviando(false);
        }
    }

    /* ── Descargar reporte ──────────────────────────────────── */
    async function handleDescargar(e) {
        e.preventDefault();

        if (!inicio || !fin) {
            return Swal.fire({
                title: 'Fechas requeridas',
                text: 'Selecciona el rango de fechas para el reporte.',
                icon: 'warning',
                confirmButtonColor: '#176682',
                confirmButtonText: 'Aceptar',
            });
        }
        if (new Date(inicio) >= new Date(fin)) {
            return Swal.fire({
                title: 'Rango inválido',
                text: 'La fecha de inicio debe ser anterior a la fecha de fin.',
                icon: 'warning',
                confirmButtonColor: '#176682',
                confirmButtonText: 'Aceptar',
            });
        }

        setDescargando(true);
        try {
            const token  = localStorage.getItem('jwt');
            const params = new URLSearchParams({
                inicio:  `${inicio}T00:00:00`,
                fin:     `${fin}T23:59:59`,
                tipo,
                formato,
            });
            if (tipo === 'ELECTRICO') params.set('fuente', fuente);

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
            const ext      = formato === 'XLSX' ? 'xlsx' : 'pdf';
            const sufTipo  = tipo === 'CLIMATICO' ? 'climatico' : `electrico_${fuente.toLowerCase()}`;
            a.download = `reporte_${sufTipo}_${inicio}_${fin}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire({
                title: 'Error al descargar',
                text: err.message,
                icon: 'error',
                confirmButtonColor: '#176682',
                confirmButtonText: 'Aceptar',
            });
        } finally {
            setDescargando(false);
        }
    }

    /* ── Render ─────────────────────────────────────────────── */
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
                    {/* ── Cargando ── */}
                    {cargando && (
                        <div className="descargar-sin-permiso">
                            <div
                                className="descargar-skeleton"
                                style={{ width: 80, height: 80, borderRadius: '50%' }}
                            />
                            <div
                                className="descargar-skeleton"
                                style={{ width: 200, height: 22, marginTop: 8 }}
                            />
                            <div
                                className="descargar-skeleton"
                                style={{ width: 300, height: 16, marginTop: 4 }}
                            />
                        </div>
                    )}

                    {/* ── Con permiso: formulario de descarga ── */}
                    {!cargando && perfil?.tienePermisoDescarga && (
                        <div className="descargar-con-permiso">
                            <form onSubmit={handleDescargar}>
                                <div className="descargar-card">

                                    <p className="descargar-seccion__titulo">Tipo de reporte</p>
                                    <div className="descargar-opciones">
                                        <RadioOpcion value="CLIMATICO"  checked={tipo === 'CLIMATICO'}  onChange={e => setTipo(e.target.value)} label="Climático" />
                                        <RadioOpcion value="ELECTRICO"  checked={tipo === 'ELECTRICO'}  onChange={e => setTipo(e.target.value)} label="Eléctrico" />
                                    </div>

                                    {tipo === 'ELECTRICO' && (
                                        <>
                                            <p className="descargar-seccion__titulo" style={{ marginTop: 18 }}>Fuente eléctrica</p>
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

                                    <p className="descargar-seccion__titulo">Rango de fechas</p>
                                    <div className="descargar-fecha-row">
                                        <div className="descargar-field-group">
                                            <label htmlFor="desc-inicio">Desde</label>
                                            <input
                                                id="desc-inicio"
                                                type="date"
                                                value={inicio}
                                                onChange={e => setInicio(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="descargar-field-group">
                                            <label htmlFor="desc-fin">Hasta</label>
                                            <input
                                                id="desc-fin"
                                                type="date"
                                                value={fin}
                                                onChange={e => setFin(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="descargar-btn descargar-btn-full"
                                        style={{ marginTop: 22 }}
                                        disabled={descargando}
                                    >
                                        {descargando ? 'Descargando…' : 'Descargar reporte'}
                                    </button>

                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Sin permiso ── */}
                    {!cargando && !perfil?.tienePermisoDescarga && (
                        <>
                            <div className="descargar-sin-permiso">
                                <ProhibidoIcon />
                                <h2 className="descargar-sin-permiso__titulo">Acceso restringido</h2>
                                <p className="descargar-sin-permiso__desc">
                                    Lo sentimos, pero actualmente no cuentas con el permiso para descargar gráficas. Necesitas solicitarlo.
                                </p>
                                <button
                                    className="descargar-btn"
                                    onClick={abrirFormulario}
                                    type="button"
                                    style={{ marginTop: 8 }}
                                >
                                    Acceder al formulario de solicitud
                                </button>
                            </div>

                            {/* ── Modal de solicitud ── */}
                            {formularioAbierto && (
                                <div
                                    className="descargar-overlay"
                                    onClick={e => { if (e.target === e.currentTarget) setFormularioAbierto(false); }}
                                >
                                    <div className="descargar-modal">
                                        <button
                                            className="descargar-modal__cerrar"
                                            onClick={() => setFormularioAbierto(false)}
                                            type="button"
                                            aria-label="Cerrar formulario"
                                        >
                                            ×
                                        </button>

                                        <h3 className="descargar-modal__titulo">Formulario de solicitud</h3>

                                        <form onSubmit={handleEnviarSolicitud} noValidate>
                                            {/* Nombre de usuario — siempre readonly */}
                                            <CampoReadOnly
                                                label="Nombre de usuario"
                                                value={perfil?.nombreUsuario ?? ''}
                                                required
                                            />

                                            {/* Nombre completo — readonly si ya está en perfil, editable si no */}
                                            {perfilTieneNombre ? (
                                                <CampoReadOnly
                                                    label="Nombre completo"
                                                    value={perfil.nombreCompleto}
                                                    required
                                                />
                                            ) : (
                                                <FormInput
                                                    label="Nombre completo"
                                                    name="nombreCompleto"
                                                    value={nombreCompleto}
                                                    onChange={e => { setNombreCompleto(e.target.value); if (errNombre) setErrNombre(''); }}
                                                    onBlur={() => {
                                                        const nc = nombreCompleto.trim();
                                                        if (!nc) setErrNombre('El nombre completo es requerido');
                                                        else if (!REGEX_NOMBRE.test(nc)) setErrNombre('Solo letras y espacios');
                                                        else if (nc.length > 90) setErrNombre('Máximo 90 caracteres');
                                                        else setErrNombre('');
                                                    }}
                                                    required
                                                    error={errNombre}
                                                    placeholder="Tu nombre completo"
                                                />
                                            )}

                                            {/* Motivo */}
                                            <FormTextarea
                                                label="¿Por qué solicita el permiso?"
                                                name="motivo"
                                                value={motivo}
                                                onChange={e => { setMotivo(e.target.value); if (errMotivo) setErrMotivo(''); }}
                                                onBlur={() => {
                                                    const mot = motivo.trim();
                                                    if (!mot) setErrMotivo('El motivo es requerido');
                                                    else if (mot.length > 255) setErrMotivo('Máximo 255 caracteres');
                                                    else setErrMotivo('');
                                                }}
                                                required
                                                error={errMotivo}
                                                placeholder="Describe el motivo de tu solicitud"
                                                maxLength={255}
                                                rows={5}
                                            />

                                            <div className="descargar-modal-footer">
                                                <button
                                                    type="submit"
                                                    className="descargar-btn descargar-btn-full"
                                                    disabled={enviando}
                                                >
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
