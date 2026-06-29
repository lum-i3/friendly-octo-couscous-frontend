import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Button from './Button';
import '../styles/styles.css';

//Plantilla reutilizable para las pantallas de error (400, 401, 403, 404, 405, 500, 503).
function ErrorPage({ code, image, imageAlt, heading, description, buttonText = 'Volver al inicio', to = '/' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const mensajePersonalizado = location.state?.message;

    return (
        <>
            <Header />
            <div className="error-page">
                <div className="error-card">
                    <div className="error-icon-circle">
                        <img src={image} alt={imageAlt} className="error-icon" />
                    </div>
                    <h1 className="error-code">ERROR {code}</h1>
                    <h2 className="error-heading">{heading}</h2>
                    <p className="error-desc">{mensajePersonalizado || description}</p>
                    <Button onClick={() => navigate(to)} full>{buttonText}</Button>
                </div>
            </div>
        </>
    );
}

export default ErrorPage;
