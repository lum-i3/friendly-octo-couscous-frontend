import { Navigate } from 'react-router-dom';
import { isTokenValid, getTokenRole } from '../../utils/auth';

/**
 * Redirige al dashboard correspondiente según el rol si ya hay sesión activa.
 * Admin/Superadmin → /admin/dashboard
 * Usuario normal   → /usuario/dashboard
 */
function PublicOnlyRoute({ children }) {
    if (!isTokenValid()) return children;
    const rol = getTokenRole();
    if (rol === 'ADMINISTRADOR' || rol === 'SUPERADMINISTRADOR') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/usuario/dashboard" replace />;
}

export default PublicOnlyRoute;
