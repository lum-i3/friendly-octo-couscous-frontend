import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../../utils/auth';

function PrivateRoute({ children }) {
    if (!isTokenValid()) {
        localStorage.removeItem('jwt');
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default PrivateRoute;
