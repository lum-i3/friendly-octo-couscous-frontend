import { Navigate } from 'react-router-dom';
import { isTokenValid, getTokenRole } from '../../utils/auth';

function AdminRoute({ children }) {
    if (!isTokenValid()) {
        localStorage.removeItem('jwt');
        return <Navigate to="/login" replace />;
    }
    const rol = getTokenRole();
    if (rol !== 'ADMINISTRADOR' && rol !== 'SUPERADMINISTRADOR') {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default AdminRoute;
