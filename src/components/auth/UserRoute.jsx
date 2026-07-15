import { Navigate } from 'react-router-dom';
import { isTokenValid, getTokenRole } from '../../utils/auth';

/**
 * Permite acceso solo a usuarios autenticados con rol USUARIO.
 * - Sin sesión → /login
 * - Admin o superadmin → /admin/dashboard (ya tiene su propio espacio)
 */
function UserRoute({ children }) {
    if (!isTokenValid()) {
        localStorage.removeItem('jwt');
        return <Navigate to="/login" replace />;
    }
    const rol = getTokenRole();
    if (rol === 'ADMINISTRADOR' || rol === 'SUPERADMINISTRADOR') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return children;
}

export default UserRoute;
