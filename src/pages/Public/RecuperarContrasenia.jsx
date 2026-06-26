import { useState } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Imagen from '../../assets/General/ImagenLogin.avif';
import { REGEX_CORREO, REGEX_PASSWORD, REGEX_CODIGO_RECUPERACION } from '../../utils/validaciones';
import '../../styles/recuperar.css';

const PASOS = {
    CORREO: 1,
    CODIGO: 2,
    NUEVA_CONTRASENIA: 3,
};

const ESTADO_INICIAL = {
    correo: '',
    codigo: '',
    nuevaContrasenia: '',
    confirmarContrasenia: '',
};

function validarCampo(name, valores) {
    const valor = valores[name];

    switch (name) {
        case 'correo':
            if (!valor.trim()) return 'El correo es obligatorio.';
            if (!REGEX_CORREO.test(valor)) return 'El formato del correo no es válido.';
            return '';

        case 'codigo':
            if (!valor.trim()) return 'El código es obligatorio.';
            if (!REGEX_CODIGO_RECUPERACION.test(valor)) return 'El código debe tener 6 dígitos.';
            return '';

        case 'nuevaContrasenia':
            if (!valor) return 'La nueva contraseña es obligatoria.';
            if (valor.length < 8) return 'Debe tener al menos 8 caracteres.';
            if (!REGEX_PASSWORD.test(valor)) return 'Debe incluir mayúscula, minúscula, número y un carácter especial (@$!%*?&_-).';
            return '';

        case 'confirmarContrasenia':
            if (!valor) return 'Confirma tu contraseña.';
            if (valor !== valores.nuevaContrasenia) return 'Las contraseñas no coinciden.';
            return '';

        default:
            return '';
    }
}

function RecuperarContrasenia() {
    const [paso, setPaso] = useState(PASOS.CORREO);
    const [valores, setValores] = useState(ESTADO_INICIAL);
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nuevosValores = { ...valores, [name]: value };
        setValores(nuevosValores);

        // Si el campo ya tenía error, lo revalidamos al teclear para feedback inmediato.
        setErrores((prev) => {
            const next = { ...prev };
            if (prev[name]) next[name] = validarCampo(name, nuevosValores);
            if (name === 'nuevaContrasenia' && prev.confirmarContrasenia) {
                next.confirmarContrasenia = validarCampo('confirmarContrasenia', nuevosValores);
            }
            return next;
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setErrores((prev) => ({ ...prev, [name]: validarCampo(name, valores) }));
    };

    const validarPaso = (campos) => {
        const nuevosErrores = {};
        campos.forEach((name) => {
            const mensaje = validarCampo(name, valores);
            if (mensaje) nuevosErrores[name] = mensaje;
        });
        setErrores((prev) => ({ ...prev, ...nuevosErrores }));
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSolicitarCodigo = (e) => {
        e.preventDefault();
        if (!validarPaso(['correo'])) return;

        // TODO: conectar con POST /api/auth/forgot-password cuando se integre el backend.
        console.log('Solicitar código de recuperación para:', valores.correo);
        setPaso(PASOS.CODIGO);
    };

    const handleVerificarCodigo = (e) => {
        e.preventDefault();
        if (!validarPaso(['codigo'])) return;

        // El backend valida el código junto con la nueva contraseña en POST /api/auth/reset-password
        // (no existe un endpoint separado para "solo verificar"), así que aquí únicamente
        // se valida el formato antes de avanzar; el código se reenviará en el último paso.
        setPaso(PASOS.NUEVA_CONTRASENIA);
    };

    const handleCrearNuevaContrasenia = (e) => {
        e.preventDefault();
        if (!validarPaso(['nuevaContrasenia', 'confirmarContrasenia'])) return;

        // TODO: conectar con POST /api/auth/reset-password cuando se integre el backend.
        // Body esperado: { correo, codigo, nuevaContrasenia, confirmarContrasenia }
        console.log('Restablecer contraseña:', valores);
    };

    return (
        <div className="recuperar-page">
            <div className="recuperar-form-col">
                <div className="recuperar-form-container">
                    {paso === PASOS.CORREO && (
                        <form onSubmit={handleSolicitarCodigo} noValidate>
                            <h1 className="recuperar-title">Recuperación de contraseña</h1>
                            <p className="recuperar-subtitle">Ingresa tu correo electrónico</p>

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

                            <Button type="submit" full style={{ marginTop: 8 }}>
                                Enviar código de recuperación
                            </Button>
                        </form>
                    )}

                    {paso === PASOS.CODIGO && (
                        <form onSubmit={handleVerificarCodigo} noValidate>
                            <h1 className="recuperar-title">Token de recuperación</h1>
                            <p className="recuperar-subtitle">El código es de un solo uso</p>
                            <p className="recuperar-desc">
                                Ingresa el código que enviamos a tu correo. Si no lo has recibido, puedes solicitar uno nuevo en 15 minutos.
                            </p>

                            <FormInput
                                label="Código de verificación"
                                name="codigo"
                                required
                                value={valores.codigo}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.codigo}
                                placeholder="123456"
                            />

                            <Button type="submit" full style={{ marginTop: 8 }}>
                                Verificar código
                            </Button>
                        </form>
                    )}

                    {paso === PASOS.NUEVA_CONTRASENIA && (
                        <form onSubmit={handleCrearNuevaContrasenia} noValidate>
                            <h1 className="recuperar-title">Nueva contraseña</h1>
                            <p className="recuperar-subtitle">Crea una nueva contraseña</p>

                            <FormInput
                                label="Contraseña"
                                name="nuevaContrasenia"
                                type="password"
                                required
                                hint="(mínimo 8 caracteres, una mayúscula y un carácter especial)"
                                value={valores.nuevaContrasenia}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errores.nuevaContrasenia}
                                placeholder="Ingresa tu nueva contraseña"
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
                                placeholder="Ingresa tu nueva contraseña"
                            />

                            <Button type="submit" full style={{ marginTop: 8 }}>
                                Crear nueva contraseña
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            <div className="recuperar-image-col">
                <div className="recuperar-image-curve">
                    <img src={Imagen} alt="Clima y energía híbrida" className="recuperar-bg-img" />
                </div>
            </div>
        </div>
    );
}

export default RecuperarContrasenia;
