import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/401.png';

function Error401() {
    return (
        <ErrorPage
            code={401}
            image={Imagen}
            imageAlt="Error 401"
            heading="Sesión expirada"
            description="Por favor, vuelve a iniciar sesión."
            buttonText="Volver al inicio"
            to="/login"
        />
    );
}

export default Error401;
