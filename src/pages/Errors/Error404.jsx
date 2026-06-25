import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/404.png';

function Error404() {
    return (
        <ErrorPage
            code={404}
            image={Imagen}
            imageAlt="Error 404"
            heading="¡Oops!"
            description="Página no encontrada."
        />
    );
}

export default Error404;
