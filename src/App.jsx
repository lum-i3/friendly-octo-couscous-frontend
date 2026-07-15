import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
//Guards de autenticación
import UserRoute from './components/auth/UserRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import AdminRoute from './components/auth/AdminRoute';
//Páginas de administrador
import DashboardAdmin from './pages/admin/DashboardAdmin';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import SolicitudesAdmin from './pages/admin/SolicitudesAdmin';
import HistorialAdmin from './pages/admin/HistorialAdmin';
import PerfilAdmin from './pages/admin/PerfilAdmin';
import AdministradoresAdmin from './pages/admin/AdministradoresAdmin';
//Páginas públicas
import DashboardVisitante from './pages/Public/DashboardVisitante';
import Login from './pages/Public/Login';
import FormRegistro from './pages/Public/FormRegistro';
import RecuperarContrasenia from './pages/Public/RecuperarContrasenia';
import VerificarCuenta from './pages/Public/VerificarCuenta';
import GraficasVisitante from './pages/Public/GraficasVisitante';
import TablaDatosUsuario from './pages/Public/TablaDatosUsuario';
//Páginas de error
import Error400 from './pages/Errors/Error400';
import Error401 from './pages/Errors/Error401';
import Error403 from './pages/Errors/Error403';
import Error404 from './pages/Errors/Error404';
import Error405 from './pages/Errors/Error405';
import Error500 from './pages/Errors/Error500';
import Error503 from './pages/Errors/Error503';
//Páginas de usuario
import DashboardUsuario from './pages/usuario/DashboardUsuario';
import GraficasUsuario from './pages/usuario/GraficasUsuario';
import MiEstacionUsuario from './pages/usuario/MiEstacionUsuario';
import DescargarGraficas from './pages/usuario/DescargarGraficas';
import Perfil from './pages/usuario/Perfil';
import EditarPerfil from './pages/usuario/EditarPerfil';
import TablasDatosUsuario from './pages/usuario/TablasDatosUsuario';

// Wrapper que inyecta los handlers de navegación al componente de gráficas
function GraficasVisitanteRoute() {
    const navigate = useNavigate();
    return (
        <GraficasVisitante
            onBack={() => navigate(-1)}
            onHome={() => navigate('/')}
        />
    );
}

function App() {
    /* Cierre de sesión sincronizado entre pestañas:
       si otra pestaña elimina el JWT, esta pestaña redirige al login. */
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'jwt' && !e.newValue) {
                window.location.replace('/login');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <Routes>

            {/* Públicas — redirigen al dashboard si hay sesión activa */}
            <Route path="/"                       element={<PublicOnlyRoute><DashboardVisitante /></PublicOnlyRoute>} />
            <Route path="/login"                  element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/registro"               element={<PublicOnlyRoute><FormRegistro /></PublicOnlyRoute>} />
            <Route path="/recuperar-contrasenia"  element={<PublicOnlyRoute><RecuperarContrasenia /></PublicOnlyRoute>} />
            <Route path="/verificar-cuenta"       element={<VerificarCuenta />} />
            <Route path="/graficas"               element={<PublicOnlyRoute><GraficasVisitanteRoute /></PublicOnlyRoute>} />
            <Route path="/tabla-datos"            element={<PublicOnlyRoute><TablaDatosUsuario /></PublicOnlyRoute>} />

            {/* Usuario — requieren sesión activa */}
            <Route path="/usuario/dashboard"      element={<UserRoute><DashboardUsuario /></UserRoute>} />
            <Route path="/usuario/graficas"       element={<UserRoute><GraficasUsuario /></UserRoute>} />
            <Route path="/usuario/estacion"       element={<UserRoute><MiEstacionUsuario /></UserRoute>} />
            <Route path="/usuario/descargar"      element={<UserRoute><DescargarGraficas /></UserRoute>} />
            <Route path="/usuario/perfil"         element={<UserRoute><Perfil /></UserRoute>} />
            <Route path="/usuario/editar-perfil"  element={<UserRoute><EditarPerfil /></UserRoute>} />
            <Route path="/usuario/tabla-datos"    element={<UserRoute><TablasDatosUsuario /></UserRoute>} />

            {/* Administrador — requieren rol ADMINISTRADOR o SUPERADMINISTRADOR */}
            <Route path="/admin/dashboard"    element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
            <Route path="/admin/usuarios"     element={<AdminRoute><UsuariosAdmin /></AdminRoute>} />
            <Route path="/admin/solicitudes"  element={<AdminRoute><SolicitudesAdmin /></AdminRoute>} />
            <Route path="/admin/historial"    element={<AdminRoute><HistorialAdmin /></AdminRoute>} />
            <Route path="/admin/perfil"          element={<AdminRoute><PerfilAdmin /></AdminRoute>} />
            <Route path="/admin/administradores" element={<AdminRoute><AdministradoresAdmin /></AdminRoute>} />

            {/* Errores */}
            <Route path="/error/400" element={<Error400 />} />
            <Route path="/error/401" element={<Error401 />} />
            <Route path="/error/403" element={<Error403 />} />
            <Route path="/error/404" element={<Error404 />} />
            <Route path="/error/405" element={<Error405 />} />
            <Route path="/error/500" element={<Error500 />} />
            <Route path="/error/503" element={<Error503 />} />

            {/* Catch-all */}
            <Route path="*" element={<Error404 />} />

        </Routes>
    );
}

export default App;
