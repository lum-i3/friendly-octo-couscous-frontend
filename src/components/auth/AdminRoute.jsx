import { Navigate } from 'react-router-dom';
import { isTokenValid, getTokenRole } from '../../utils/auth';

/**
 * Permite acceso solo a ADMINISTRADOR y SUPERADMINISTRADOR.
 * - Sin sesión → /login
 * - Usuario normal autenticado → /usuario/dashboard (su propio espacio)
 */
function AdminRoute({ children }) {
    if (!isTokenValid()) {
        localStorage.removeItem('jwt');
        return <Navigate to="/login" replace />;
    }
    const rol = getTokenRole();
    if (rol !== 'ADMINISTRADOR' && rol !== 'SUPERADMINISTRADOR') {
        return <Navigate to="/error/403" replace />;
    }
    return children;
}

export default AdminRoute;
