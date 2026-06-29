import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/400.png';

function Error400() {
    return (
        <ErrorPage
            code={400}
            image={Imagen}
            imageAlt="Error 400"
            heading="Solicitud inválida"
            description="Algo en tu solicitud no es correcto. Verifica los datos e inténtalo de nuevo."
        />
    );
}

export default Error400;
