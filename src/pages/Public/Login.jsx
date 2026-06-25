import { useState } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import LinkText from '../../components/LinkText';
import Checkbox from '../../components/Checkbox';
import Imagen from '../../assets/General/ImagenLogin.avif';
import '../../styles/login.css';

const ESTADO_INICIAL = {
    correo: '',
    contrasenia: '',
    recordarme: false,
};

function Login() {
    const [valores, setValores] = useState(ESTADO_INICIAL);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        setValores((prev) => ({ ...prev, recordarme: e.target.checked }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: conectar con POST /api/auth/login cuando se integre el backend.
        console.log('Intento de inicio de sesión:', valores);
    };

    return (
        <div className="login-page">
            <div className="login-form-col">
                <div className="login-form-container">
                    <h1 className="login-title">Iniciar sesión</h1>
                    <p className="login-subtitle">Ingresa tus credenciales para acceder</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <FormInput
                            label="Correo Electrónico"
                            name="correo"
                            type="email"
                            value={valores.correo}
                            onChange={handleChange}
                            placeholder="tu.email@empresa.com"
                        />

                        <FormInput
                            label="Contraseña"
                            name="contrasenia"
                            type="password"
                            value={valores.contrasenia}
                            onChange={handleChange}
                            placeholder="Ingresa tu contraseña"
                        />

                        <div className="login-extra-options">
                            <Checkbox
                                label="Recordarme"
                                name="recordarme"
                                checked={valores.recordarme}
                                onChange={handleCheckboxChange}
                            />
                            <LinkText to="/recuperar-contrasenia">¿Olvidaste tu contraseña?</LinkText>
                        </div>

                        <Button type="submit" full>
                            Iniciar sesión
                        </Button>

                        <p className="login-register-redirect">
                            ¿No tienes una cuenta? <LinkText to="/registro">Crear una cuenta</LinkText>
                        </p>
                    </form>
                </div>
            </div>

            <div className="login-image-col">
                <div className="login-image-curve">
                    <img src={Imagen} alt="Clima y energía híbrida" className="login-bg-img" />
                </div>
            </div>
        </div>
    );
}

export default Login;
