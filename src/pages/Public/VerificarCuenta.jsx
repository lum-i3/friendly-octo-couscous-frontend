import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import LinkText from '../../components/LinkText';
import NavBackBtn from '../../components/NavBackBtn';
import NavHomeBtn from '../../components/NavHomeBtn';
import Imagen from '../../assets/General/ImagenLogin.avif';
import { REGEX_CORREO, REGEX_CODIGO_RECUPERACION } from '../../utils/validaciones';
import { verificarCuenta } from '../../services/authService';
import '../../styles/recuperar.css';

function validarCampo(name, valores) {
    const valor = valores[name];
    switch (name) {
        case 'correo':
            if (!valor.trim()) return 'El correo es obligatorio.';
            if (!REGEX_CORREO.test(valor)) return 'El formato del correo no es válido.';
            return '';
        case 'codigo':
            if (!valor.trim()) return 'El código es obligatorio.';
            if (!REGEX_CODIGO_RECUPERACION.test(valor)) return 'El código debe tener exactamente 6 dígitos.';
            return '';
        default:
            return '';
    }
}

function VerificarCuenta() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [valores, setValores] = useState({
        correo: state?.correo ?? '',
        codigo: '',
    });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nuevosValores = { ...valores, [name]: value };
        setValores(nuevosValores);
        setErrores((prev) => {
            if (!(name in prev)) return prev;
            return { ...prev, [name]: validarCampo(name, nuevosValores) };
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setErrores((prev) => ({ ...prev, [name]: validarCampo(name, valores) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cargando) return;

        const nuevosErrores = {};
        ['correo', 'codigo'].forEach((name) => {
            const msg = validarCampo(name, valores);
            if (msg) nuevosErrores[name] = msg;
        });
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) {
            const primerCampo = Object.keys(nuevosErrores)[0];
            document.getElementById(primerCampo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setCargando(true);
        try {
            await verificarCuenta(valores.correo, parseInt(valores.codigo, 10));
            await Swal.fire({
                icon: 'success',
                title: '¡Cuenta activada!',
                text: 'Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión.',
                confirmButtonColor: '#176682',
            });
            navigate('/login');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Código inválido',
                text: err.message,
                confirmButtonColor: '#176682',
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Header />
            <div className="recuperar-page">
                <div className="recuperar-form-col">
                    <div className="auth-page-nav">
                        <NavBackBtn onClick={() => navigate(-1)} />
                        <NavHomeBtn onClick={() => navigate('/')} />
                    </div>
                    <div className="auth-form-center">
                        <div className="recuperar-form-container">
                            <form onSubmit={handleSubmit} noValidate>
                                <h1 className="recuperar-title">Activa tu cuenta</h1>
                                <p className="recuperar-subtitle">Ingresa el código que recibiste por correo</p>
                                <p className="recuperar-desc">
                                    El código tiene 6 dígitos y es válido por 15 minutos.
                                </p>

                                <FormInput
                                    label="Correo electrónico"
                                    name="correo"
                                    type="email"
                                    required
                                    value={valores.correo}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errores.correo}
                                    placeholder="tu.correo@ejemplo.com"
                                />

                                <FormInput
                                    label="Código de verificación"
                                    name="codigo"
                                    required
                                    value={valores.codigo}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errores.codigo}
                                    placeholder="Ej. 123456"
                                />

                                <Button type="submit" full style={{ marginTop: 8 }} loading={cargando}>
                                    {cargando ? 'Verificando...' : 'Activar cuenta'}
                                </Button>

                                <p className="recuperar-desc" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                                    ¿No recibiste el código?{' '}
                                    <LinkText to="/registro">Regístrate de nuevo</LinkText>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="recuperar-image-col">
                    <div className="recuperar-image-curve">
                        <img src={Imagen} alt="Clima y energía híbrida" className="recuperar-bg-img" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default VerificarCuenta;
