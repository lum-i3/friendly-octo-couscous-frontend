import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../../utils/auth';

/**
 * Redirige al dashboard de usuario si ya hay una sesión activa.
 * Úsalo en rutas públicas (login, registro, etc.) para evitar
 * que un usuario autenticado regrese a ellas.
 */
function PublicOnlyRoute({ children }) {
    if (isTokenValid()) {
        return <Navigate to="/usuario/dashboard" replace />;
    }
    return children;
}

export default PublicOnlyRoute;
