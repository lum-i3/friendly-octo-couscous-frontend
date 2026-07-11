import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import FormInput from '../../components/FormInput';
import useUserProfile from '../../hooks/useUserProfile';
import { ADMIN_ITEMS } from '../../utils/sidebarItems.jsx';
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

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12l3-3-3-3M15 9H7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function PerfilAdmin() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    /* ── Estado: datos generales ── */
    const [correo, setCorreo]                 = useState('');
    const [nombreUsuario, setNombreUsuario]   = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [fotoPreview, setFotoPreview]       = useState(null);
    const [fotoNueva, setFotoNueva]           = useState(null);
    const [errG, setErrG]                     = useState({});
    const [guardandoG, setGuardandoG]         = useState(false);

    /* ── Estado: contraseña ── */
    const [pasActual, setPasActual]       = useState('');
    const [pasNueva, setPasNueva]         = useState('');
    const [pasConfirmar, setPasConfirmar] = useState('');
    const [errP, setErrP]                 = useState({});
    const [guardandoP, setGuardandoP]     = useState(false);

    /* ── Estado: preferencia de alertas ── */
    const [preferencia, setPreferencia] = useState('TODAS');

    const fotoRef = useRef(null);

    /* Carga datos del perfil */
    useEffect(() => {
        if (!perfil) return;
        setCorreo(perfil.correo || '');
        setNombreUsuario(perfil.nombreUsuario || '');
        setNombreCompleto(perfil.nombreCompleto || '');
        if (perfil.fotoPerfil) {
            setFotoPreview('data:image/jpeg;base64,' + perfil.fotoPerfil);
        }
    }, [perfil]);

    /* Carga preferencia de alertas */
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

    /* ── Foto ── */
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
        if (!validarGenerales()) return;
        setGuardandoG(true);
        const token = localStorage.getItem('jwt');
        const body = {};
        if (nombreUsuario)  body.nombreUsuario  = nombreUsuario;
        if (nombreCompleto) body.nombreCompleto = nombreCompleto;
        if (fotoNueva)      body.fotoPerfil     = fotoNueva;

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (res.ok) {
                setFotoNueva(null);
                Swal.fire({ icon: 'success', title: 'Perfil actualizado', text: json.mensaje || 'Los cambios se guardaron correctamente.', timer: 2500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo actualizar el perfil.' });
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
        if (!pasActual.trim()) errs.pasActual = 'Ingresa tu contraseña actual.';
        if (!pasNueva.trim()) {
            errs.pasNueva = 'Ingresa la nueva contraseña.';
        } else if (!REGEX_PASSWORD.test(pasNueva)) {
            errs.pasNueva = 'Mínimo 8 caracteres: mayúscula, minúscula, número y símbolo (@$!%*?&_-).';
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
        if (!validarPassword()) return;
        setGuardandoP(true);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    contraseniaActual:    pasActual,
                    nuevaContrasenia:     pasNueva,
                    confirmarContrasenia: pasConfirmar,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                setPasActual(''); setPasNueva(''); setPasConfirmar('');
                Swal.fire({ icon: 'success', title: 'Contraseña actualizada', text: json.mensaje || 'Tu contraseña se cambió correctamente.', timer: 2500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo cambiar la contraseña.' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        } finally {
            setGuardandoP(false);
        }
    };

    /* ── Preferencia de alertas ── */
    const handlePreferenciaChange = async (nuevaPref) => {
        if (nuevaPref === preferencia) return;
        const prevPref = preferencia;
        setPreferencia(nuevaPref);
        const token = localStorage.getItem('jwt');
        try {
            const res = await fetch('/api/alertas/configuracion', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ preferencia: nuevaPref }),
            });
            if (!res.ok) {
                setPreferencia(prevPref);
                const json = await res.json();
                Swal.fire({ icon: 'error', title: 'Error', text: json.mensaje || 'No se pudo actualizar la preferencia.' });
            }
        } catch {
            setPreferencia(prevPref);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    };

    /* ── Logout ── */
    const handleLogout = useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#E94E50',
            cancelButtonColor: '#176682',
        });
        if (isConfirmed) { localStorage.removeItem('jwt'); navigate('/login', { replace: true }); }
    }, [navigate]);

    const headerActions = (
        <button className="nav-action-btn nav-action-btn--danger" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon />
        </button>
    );

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={ADMIN_ITEMS}
                    user={sidebarUser}
                    titulo="Mi perfil y preferencias"
                    actions={headerActions}
                >
                    <div className="editar-perfil-page">

                        {/* ── Foto ── */}
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
                                        label="Contraseña actual"
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

export default PerfilAdmin;
