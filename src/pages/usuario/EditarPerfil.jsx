import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import FormInput from '../../components/FormInput';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import { REGEX_USUARIO, REGEX_NOMBRE, REGEX_PASSWORD } from '../../utils/validaciones';
import EditIcon from '../../assets/Icons/EditIcon.png';
import UserIconDefault from '../../assets/Icons/UserIcon.png';
import '../../styles/dashboard.css';
import '../../styles/perfil.css';

const ALERTAS = [
    { key: 'TODAS',   label: 'Recibir todas las alertas'   },
    { key: 'SISTEMA', label: 'Recibir solo las necesarias' },
    { key: 'NINGUNA', label: 'No recibir ninguna alerta'   },
];

/* ── Campo de solo lectura (correo) ── */
function CampoReadOnly({ label, value }) {
    return (
        <div className="field">
            <div className="field-label-row">
                <label className="field-label">{label}</label>
            </div>
            <div className="field-input-wrapper">
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="field-input editar-perfil-readonly"
                    tabIndex={-1}
                />
            </div>
        </div>
    );
}

function EditarPerfil() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Estado: datos generales ── */
    const [correo, setCorreo]               = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [fotoPreview, setFotoPreview]     = useState(null);
    const [fotoNueva, setFotoNueva]         = useState(null);
    const [errG, setErrG]                   = useState({});
    const [guardandoG, setGuardandoG]       = useState(false);

    /* ── Estado: contraseña ── */
    const [pasActual, setPasActual]         = useState('');
    const [pasNueva, setPasNueva]           = useState('');
    const [pasConfirmar, setPasConfirmar]   = useState('');
    const [errP, setErrP]                   = useState({});
    const [guardandoP, setGuardandoP]       = useState(false);

    /* ── Estado: preferencia de alertas (TODAS | SISTEMA | NINGUNA) ── */
    const [preferencia, setPreferencia] = useState('TODAS');

    const fotoRef = useRef(null);

    /* Carga datos del perfil al montar */
    useEffect(() => {
        if (!perfil) return;
        setCorreo(perfil.correo || '');
        setNombreUsuario(perfil.nombreUsuario || '');
        setNombreCompleto(perfil.nombreCompleto || '');
        if (perfil.fotoPerfil) {
            setFotoPreview('data:image/jpeg;base64,' + perfil.fotoPerfil);
        }
    }, [perfil]);

    /* Carga preferencia de alertas al montar */
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;
        fetch('/api/alertas/configuracion', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (json?.datos?.preferencia) setPreferencia(json.datos.preferencia);
            })
            .catch(() => {});
    }, []);

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    /* ── Foto: selección de archivo ── */
    const handleFotoClick = () => fotoRef.current?.click();

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFotoPreview(reader.result);
            setFotoNueva(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    /* ── Validación: datos generales ── */
    const validarGenerales = () => {
        const errs = {};
        if (!nombreUsuario.trim()) {
            errs.nombreUsuario = 'El nombre de usuario es obligatorio.';
        } else if (nombreUsuario.length < 3 || nombreUsuario.length > 60) {
            errs.nombreUsuario = 'Debe tener entre 3 y 60 caracteres.';
        } else if (!REGEX_USUARIO.test(nombreUsuario)) {
            errs.nombreUsuario = 'Solo letras, números, puntos, guiones y guiones bajos.';
        }
        if (nombreCompleto.trim() && !REGEX_NOMBRE.test(nombreCompleto.trim())) {
            errs.nombreCompleto = 'Solo letras y espacios.';
        }
        setErrG(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Guardar datos generales ── */
    const handleGuardarGenerales = async () => {
        if (!validarGenerales()) {
            Swal.fire({
                icon: 'warning',
                title: 'Revisa los campos',
                text: 'Hay errores en el formulario. Corrígelos antes de continuar.',
                confirmButtonColor: '#176682',
            });
            return;
        }
        setGuardandoG(true);
        const token = localStorage.getItem('jwt');
        const body = {};
        if (nombreUsuario) body.nombreUsuario = nombreUsuario;
        if (nombreCompleto) body.nombreCompleto = nombreCompleto;
        if (fotoNueva) body.fotoPerfil = fotoNueva;

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (res.ok) {
                setFotoNueva(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil actualizado',
                    text: json.mensaje || 'Los cambios se guardaron correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: json.mensaje || 'No se pudo actualizar el perfil.',
                });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        } finally {
            setGuardandoG(false);
        }
    };

    /* ── Validación: contraseña ── */
    const validarPassword = () => {
        const errs = {};
        if (!pasActual.trim()) {
            errs.pasActual = 'Ingresa tu contraseña actual.';
        }
        if (!pasNueva.trim()) {
            errs.pasNueva = 'Ingresa la nueva contraseña.';
        } else if (!REGEX_PASSWORD.test(pasNueva)) {
            errs.pasNueva = 'Mínimo 8 caracteres: mayúscula, minúscula, número y al menos un símbolo.';
        }
        if (!pasConfirmar.trim()) {
            errs.pasConfirmar = 'Confirma la nueva contraseña.';
        } else if (pasNueva !== pasConfirmar) {
            errs.pasConfirmar = 'Las contraseñas no coinciden.';
        }
        setErrP(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Cambiar contraseña ── */
    const handleCambiarContrasenia = async () => {
        if (!validarPassword()) {
            Swal.fire({
                icon: 'warning',
                title: 'Revisa los campos',
                text: 'Hay errores en el formulario. Corrígelos antes de continuar.',
                confirmButtonColor: '#176682',
            });
            return;
        }
        setGuardandoP(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    contraseniaActual:    pasActual,
                    nuevaContrasenia:     pasNueva,
                    confirmarContrasenia: pasConfirmar,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                setPasActual(''); setPasNueva(''); setPasConfirmar('');
                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña actualizada',
                    text: json.mensaje || 'Tu contraseña se cambió correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo cambiar la contraseña.' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        } finally {
            setGuardandoP(false);
        }
    };

    /* ── Preferencia de alertas: selección excluyente + PUT backend ── */
    const handlePreferenciaChange = async (nuevaPref) => {
        if (nuevaPref === preferencia) return;
        const { isConfirmed } = await Swal.fire({
            title: '¿Cambiar preferencia de alertas?',
            text: `Vas a cambiar a "${ALERTAS.find(a => a.key === nuevaPref)?.label}".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#176682',
            cancelButtonColor: '#6b7a80',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });
        if (!isConfirmed) return;
        const prevPref = preferencia;
        setPreferencia(nuevaPref);                          // optimistic
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch('/api/alertas/configuracion', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ preferencia: nuevaPref }),
            });
            if (!res.ok) {
                setPreferencia(prevPref);                   // revert
                const json = await res.json();
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo actualizar la preferencia.' });
            }
        } catch {
            setPreferencia(prevPref);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    };

    /* ── Desactivar cuenta (flujo multi-paso) ── */
    const handleDesactivar = async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Desactivar cuenta?',
            text: 'Se enviará un código de verificación a tu correo electrónico.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E94E50',
            cancelButtonColor: '#176682',
            confirmButtonText: 'Enviar código',
            cancelButtonText: 'Cancelar',
        });
        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');

        try {
            const res = await fetch('/api/user/request-deactivation', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const json = await res.json();
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo enviar el código.' });
                return;
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
            return;
        }

        const { value: datos } = await Swal.fire({
            title: 'Confirmar desactivación',
            html: `
                <p style="font-size:0.84rem;color:#555;margin:0 0 12px">
                    Ingresa el código enviado a tu correo y tu contraseña actual.
                </p>
                <input id="sw-codigo" class="swal2-input" placeholder="Código (6 dígitos)"
                    type="text" maxlength="6" inputmode="numeric" />
                <input id="sw-pass" class="swal2-input" placeholder="Contraseña actual"
                    type="password" />
            `,
            showCancelButton: true,
            confirmButtonColor: '#E94E50',
            cancelButtonColor: '#176682',
            confirmButtonText: 'Desactivar',
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            preConfirm: () => {
                const codigo = document.getElementById('sw-codigo').value.trim();
                const pass   = document.getElementById('sw-pass').value;
                if (!codigo || !pass) {
                    Swal.showValidationMessage('Completa todos los campos.');
                    return false;
                }
                if (!/^\d{6}$/.test(codigo)) {
                    Swal.showValidationMessage('El código debe tener exactamente 6 dígitos.');
                    return false;
                }
                return { codigoToken: parseInt(codigo, 10), contrasenia: pass };
            },
        });
        if (!datos) return;

        try {
            const res = await fetch('/api/user/deactivate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });
            const json = await res.json();
            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Cuenta desactivada',
                    text: json.mensaje || 'Tu cuenta ha sido desactivada.',
                    timer: 3000,
                    showConfirmButton: false,
                });
                localStorage.removeItem('jwt');
                navigate('/');
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo desactivar la cuenta.' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    };

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Mi perfil y preferencias"
                    onBack={() => navigate(-1)}
                    onHome={() => navigate('/')}
                >
                    <div className="editar-perfil-page">

                        {/* ── Foto + botón desactivar ── */}
                        <div className="editar-perfil-header">
                            <input
                                ref={fotoRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFotoChange}
                            />
                            <div className="editar-perfil-foto-wrap">
                                <img
                                    src={fotoPreview || UserIconDefault}
                                    alt="Foto de perfil"
                                    className="editar-perfil-foto"
                                />
                                <button
                                    className="editar-perfil-foto-btn"
                                    onClick={handleFotoClick}
                                    title="Cambiar foto de perfil"
                                    type="button"
                                >
                                    <img src={EditIcon} alt="Editar" className="editar-perfil-foto-btn__icon" />
                                </button>
                            </div>

                            <button
                                className="editar-perfil-desactivar-btn"
                                onClick={handleDesactivar}
                                type="button"
                            >
                                Desactivar cuenta
                            </button>
                        </div>

                        {/* ── Sección: Generales ── */}
                        <div className="editar-perfil-section">
                            <h3 className="editar-perfil-section__titulo">Generales</h3>
                            <div className="editar-perfil-box">
                                <div className="editar-perfil-campos">
                                    <CampoReadOnly label="Correo electrónico" value={correo} />
                                    <FormInput
                                        label="Nombre de usuario"
                                        name="nombreUsuario"
                                        value={nombreUsuario}
                                        onChange={e => {
                                            setNombreUsuario(e.target.value);
                                            if (errG.nombreUsuario) setErrG(p => ({ ...p, nombreUsuario: '' }));
                                        }}
                                        onBlur={validarGenerales}
                                        error={errG.nombreUsuario}
                                        placeholder="usuario123"
                                    />
                                    <FormInput
                                        label="Nombre"
                                        name="nombreCompleto"
                                        value={nombreCompleto}
                                        onChange={e => {
                                            setNombreCompleto(e.target.value);
                                            if (errG.nombreCompleto) setErrG(p => ({ ...p, nombreCompleto: '' }));
                                        }}
                                        onBlur={validarGenerales}
                                        error={errG.nombreCompleto}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div className="editar-perfil-action-row">
                                    <button
                                        className="editar-perfil-btn"
                                        onClick={handleGuardarGenerales}
                                        disabled={guardandoG}
                                        type="button"
                                    >
                                        {guardandoG ? 'Guardando…' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Sección: Alertas ── */}
                        <div className="editar-perfil-section">
                            <h3 className="editar-perfil-section__titulo">Ajuste de alertas del sistema</h3>
                            <div className="editar-perfil-alertas">
                                {ALERTAS.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        className="editar-perfil-toggle"
                                        onClick={() => handlePreferenciaChange(key)}
                                        type="button"
                                        aria-pressed={preferencia === key}
                                    >
                                        <span className={`editar-perfil-switch${preferencia === key ? ' editar-perfil-switch--activo' : ''}`}>
                                            <span className="editar-perfil-switch__thumb" />
                                        </span>
                                        <span className="editar-perfil-toggle__label">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Sección: Cambio de contraseña ── */}
                        <div className="editar-perfil-section">
                            <h3 className="editar-perfil-section__titulo">Cambio de contraseña</h3>
                            <div className="editar-perfil-box">
                                <div className="editar-perfil-campos">
                                    <FormInput
                                        label="Contraseña nueva"
                                        name="pasNueva"
                                        type="password"
                                        value={pasNueva}
                                        onChange={e => {
                                            setPasNueva(e.target.value);
                                            if (errP.pasNueva) setErrP(p => ({ ...p, pasNueva: '' }));
                                        }}
                                        required
                                        error={errP.pasNueva}
                                        placeholder="••••••••"
                                    />
                                    <FormInput
                                        label="Confirme contraseña"
                                        name="pasConfirmar"
                                        type="password"
                                        value={pasConfirmar}
                                        onChange={e => {
                                            setPasConfirmar(e.target.value);
                                            if (errP.pasConfirmar) setErrP(p => ({ ...p, pasConfirmar: '' }));
                                        }}
                                        required
                                        error={errP.pasConfirmar}
                                        placeholder="••••••••"
                                    />
                                    <FormInput
                                        label="Ingrese contraseña actual"
                                        name="pasActual"
                                        type="password"
                                        value={pasActual}
                                        onChange={e => {
                                            setPasActual(e.target.value);
                                            if (errP.pasActual) setErrP(p => ({ ...p, pasActual: '' }));
                                        }}
                                        required
                                        error={errP.pasActual}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="editar-perfil-action-row">
                                    <button
                                        className="editar-perfil-btn"
                                        onClick={handleCambiarContrasenia}
                                        disabled={guardandoP}
                                        type="button"
                                    >
                                        {guardandoP ? 'Modificando…' : 'Modificar contraseña'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </SidebarLayout>
            </div>
        </div>
    );
}

export default EditarPerfil;
