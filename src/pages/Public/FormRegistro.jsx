import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import LinkText from '../../components/LinkText';
import Imagen from '../../assets/General/ImagenForm.avif';
import { REGEX_USUARIO, REGEX_CORREO, REGEX_NOMBRE, REGEX_PASSWORD } from '../../utils/validaciones';
import { registrar } from '../../services/authService';
import '../../styles/register.css';

const ESTADO_INICIAL = {
    nombreUsuario: '',
    correo: '',
    nombreCompleto: '',
    contrasenia: '',
    confirmarContrasenia: '',
};

function validarCampo(name, valores) {
    const valor = valores[name];

    switch (name) {
        case 'nombreUsuario':
            if (!valor.trim()) return 'El nombre de usuario es obligatorio.';
            if (valor.length < 3 || valor.length > 60) return 'Debe tener entre 3 y 60 caracteres.';
            if (!REGEX_USUARIO.test(valor)) return 'Solo letras, números, puntos, guiones y guiones bajos.';
            return '';

        case 'correo':
            if (!valor.trim()) return 'El correo es obligatorio.';
            if (valor.length > 60) return 'No puede superar los 60 caracteres.';
            if (!REGEX_CORREO.test(valor)) return 'El formato del correo no es válido.';
            return '';

        case 'nombreCompleto':
            if (!valor.trim()) return '';
            if (valor.length > 90) return 'No puede superar los 90 caracteres.';
            if (!REGEX_NOMBRE.test(valor)) return 'Solo letras y un espacio entre palabras.';
            return '';

        case 'contrasenia':
            if (!valor) return 'La contraseña es obligatoria.';
            if (valor.length < 8) return 'Debe tener al menos 8 caracteres.';
            if (!REGEX_PASSWORD.test(valor)) return 'Debe incluir mayúscula, minúscula, número y un carácter especial (@$!%*?&_-).';
            return '';

        case 'confirmarContrasenia':
            if (!valor) return 'Confirma tu contraseña.';
            if (valor !== valores.contrasenia) return 'Las contraseñas no coinciden.';
            return '';

        default:
            return '';
    }
}

function FormRegistro() {
    const navigate = useNavigate();
    const [valores, setValores] = useState(ESTADO_INICIAL);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nuevosValores = { ...valores, [name]: value };
        setValores(nuevosValores);

        setErrores((prev) => {
            const next = { ...prev };
            if (prev[name]) next[name] = validarCampo(name, nuevosValores);
            if (name === 'contrasenia' && prev.confirmarContrasenia) {
                next.confirmarContrasenia = validarCampo('confirmarContrasenia', nuevosValores);
            }
            return next;
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
        Object.keys(valores).forEach((name) => {
            const mensaje = validarCampo(name, valores);
            if (mensaje) nuevosErrores[name] = mensaje;
        });
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        setCargando(true);
        try {
            await registrar(valores);
            await Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                confirmButtonColor: '#176682',
            });
            navigate('/login');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrarse',
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
            <div className="register-page">
                <div className="register-image-col">
                    <div className="register-image-curve">
                        <img src={Imagen} alt="Campo de cultivo con aerogeneradores" className="register-bg-img" />
                    </div>
                </div>

                <div className="register-form-col">
                    <div className="register-form-container">
                        <h1 className="register-title">¡Regístrate!</h1>
                        <p className="register-subtitle">Ingresa los datos correspondientes</p>

                        <form onSubmit={handleSubmit} noValidate>
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
                                label="Nombre completo"
                                name="nombreCompleto"
                                value={valores.nombreCompleto}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.nombreCompleto}
                                placeholder="Ingresa tu nombre completo"
                            />

                            <FormInput
                                label="Nombre de usuario"
                                name="nombreUsuario"
                                required
                                value={valores.nombreUsuario}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.nombreUsuario}
                                placeholder="Ingresa tu nombre de usuario"
                            />

                            <FormInput
                                label="Contraseña"
                                name="contrasenia"
                                type="password"
                                required
                                hint="Mín. 8 caracteres, mayúscula y símbolo"
                                value={valores.contrasenia}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.contrasenia}
                                placeholder="Ingresa tu contraseña"
                            />

                            <FormInput
                                label="Confirma tu contraseña"
                                name="confirmarContrasenia"
                                type="password"
                                required
                                value={valores.confirmarContrasenia}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.confirmarContrasenia}
                                placeholder="Repite tu contraseña"
                            />

                            <Button type="submit" full style={{ marginTop: 8 }} disabled={cargando}>
                                {cargando ? 'Registrando...' : 'Registrarme'}
                            </Button>

                            <p className="register-login-redirect">
                                <LinkText to="/login">Ya tengo una cuenta</LinkText>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FormRegistro;
