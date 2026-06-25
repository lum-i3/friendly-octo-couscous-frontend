import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/405.png';

function Error405() {
    return (
        <ErrorPage
            code={405}
            image={Imagen}
            imageAlt="Error 405"
            heading="Método no permitido"
            description="Esta acción no está disponible en esta sección."
        />
    );
}

export default Error405;
