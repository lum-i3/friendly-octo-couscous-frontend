import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/403.png';

function Error403() {
    return (
        <ErrorPage
            code={403}
            image={Imagen}
            imageAlt="Error 403"
            heading="Acceso denegado"
            description="No tienes permisos para ver esta sección."
        />
    );
}

export default Error403;
