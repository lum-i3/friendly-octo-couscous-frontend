import { useState } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import LinkText from '../../components/LinkText';
import Imagen from '../../assets/General/ImagenForm.avif';
import '../../styles/register.css';

const REGEX_USUARIO = /^[a-zA-Z0-9._-]+$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?: [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/;
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;

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
            if (!valor.trim()) return ''; // opcional
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
    const [valores, setValores] = useState(ESTADO_INICIAL);
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nuevosValores = { ...valores, [name]: value };
        setValores(nuevosValores);

        // Si el campo ya tenía error, lo revalidamos al teclear para feedback inmediato.
        // La confirmación también se revisa de nuevo si cambia la contraseña.
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevosErrores = {};
        Object.keys(valores).forEach((name) => {
            const mensaje = validarCampo(name, valores);
            if (mensaje) nuevosErrores[name] = mensaje;
        });
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) return;

        // TODO: conectar con POST /api/auth/registrar cuando se integre el backend.
        // Por ahora el formulario solo valida en el cliente.
        console.log('Formulario válido, listo para enviar:', valores);
    };

    return (
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
                            label="Correo Electrónico"
                            name="correo"
                            type="email"
                            required
                            value={valores.correo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errores.correo}
                            placeholder="tu.email@empresa.com"
                        />

                        <FormInput
                            label="Nombre completo"
                            name="nombreCompleto"
                            value={valores.nombreCompleto}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errores.nombreCompleto}
                            placeholder="Lucia López Barrera"
                        />

                        <FormInput
                            label="Nombre de usuario"
                            name="nombreUsuario"
                            required
                            value={valores.nombreUsuario}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errores.nombreUsuario}
                            placeholder="SabrinaCarpenter67"
                        />

                        <FormInput
                            label="Contraseña"
                            name="contrasenia"
                            type="password"
                            required
                            hint="(mínimo 8 caracteres, una mayúscula y un carácter especial)"
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
                            placeholder="Ingresa tu contraseña"
                        />

                        <Button type="submit" full style={{ marginTop: 8 }}>
                            Registrarme
                        </Button>

                        <p className="register-login-redirect">
                            <LinkText to="/login">Ya tengo una cuenta</LinkText>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FormRegistro;
