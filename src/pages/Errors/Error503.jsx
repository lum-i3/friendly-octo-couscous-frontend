import ErrorPage from '../../components/ErrorPage';
import Imagen from '../../assets/Errors/503.png';

function Error503() {
    return (
        <ErrorPage
            code={503}
            image={Imagen}
            imageAlt="Error 503"
            heading="Servicio no disponible"
            description="No pudimos conectar con un servicio externo. Los datos mostrados pueden no ser los más recientes."
        />
    );
}

export default Error503;
