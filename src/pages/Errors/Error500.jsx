import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/500.png';

function Error500() {
    return (
        <ErrorPage
            code={500}
            image={Imagen}
            imageAlt="Error 500"
            heading="¡No eres tú, somos nosotros!"
            description="Error en servidor. Ya estamos trabajando en ello."
        />
    );
}

export default Error500;
