import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import LinkText from '../../components/LinkText';
import Checkbox from '../../components/Checkbox';
import NavBackBtn from '../../components/NavBackBtn';
import NavHomeBtn from '../../components/NavHomeBtn';
import Imagen from '../../assets/General/ImagenLogin.avif';
import { login } from '../../services/authService';
import '../../styles/login.css';

const ESTADO_INICIAL = {
    correo: '',
    contrasenia: '',
    recordarme: false,
};

function Login() {
    const navigate = useNavigate();
    const [valores, setValores] = useState(ESTADO_INICIAL);
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        setValores((prev) => ({ ...prev, recordarme: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cargando) return;

        setCargando(true);
        try {
            const data = await login(valores.correo, valores.contrasenia);
            if (data.token) localStorage.setItem('jwt', data.token);
            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
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
            <div className="login-page">
                <div className="login-form-col">
                    <div className="auth-page-nav">
                        <NavBackBtn onClick={() => navigate(-1)} />
                        <NavHomeBtn onClick={() => navigate('/')} />
                    </div>
                    <div className="auth-form-center">
                        <div className="login-form-container">
                            <h1 className="login-title">Iniciar sesión</h1>
                            <p className="login-subtitle">Ingresa tus credenciales para acceder</p>

                            <form onSubmit={handleSubmit} noValidate>
                                <FormInput
                                    label="Correo electrónico"
                                    name="correo"
                                    type="email"
                                    value={valores.correo}
                                    onChange={handleChange}
                                    placeholder="tu.correo@ejemplo.com"
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

                                <Button type="submit" full disabled={cargando}>
                                    {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
                                </Button>

                                <p className="login-register-redirect">
                                    ¿No tienes una cuenta? <LinkText to="/registro">Crear una cuenta</LinkText>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="login-image-col">
                    <div className="login-image-curve">
                        <img src={Imagen} alt="Clima y energía híbrida" className="login-bg-img" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
