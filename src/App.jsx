import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
//Guards de autenticación
import UserRoute from './components/auth/UserRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import AdminRoute from './components/auth/AdminRoute';
//Páginas de administrador
const DashboardAdmin       = lazy(() => import('./pages/admin/DashboardAdmin'));
const UsuariosAdmin        = lazy(() => import('./pages/admin/UsuariosAdmin'));
const SolicitudesAdmin     = lazy(() => import('./pages/admin/SolicitudesAdmin'));
const HistorialAdmin       = lazy(() => import('./pages/admin/HistorialAdmin'));
const PerfilAdmin          = lazy(() => import('./pages/admin/PerfilAdmin'));
const AdministradoresAdmin = lazy(() => import('./pages/admin/AdministradoresAdmin'));
const RespaldoAdmin        = lazy(() => import('./pages/admin/RespaldoAdmin'));
//Páginas públicas
const DashboardVisitante   = lazy(() => import('./pages/Public/DashboardVisitante'));
const Login                = lazy(() => import('./pages/Public/Login'));
const FormRegistro         = lazy(() => import('./pages/Public/FormRegistro'));
const RecuperarContrasenia = lazy(() => import('./pages/Public/RecuperarContrasenia'));
const VerificarCuenta      = lazy(() => import('./pages/Public/VerificarCuenta'));
const GraficasVisitante    = lazy(() => import('./pages/Public/GraficasVisitante'));
const TablaDatosUsuario    = lazy(() => import('./pages/Public/TablaDatosUsuario'));
//Páginas de error
const Error400 = lazy(() => import('./pages/Errors/Error400'));
const Error401 = lazy(() => import('./pages/Errors/Error401'));
const Error403 = lazy(() => import('./pages/Errors/Error403'));
const Error404 = lazy(() => import('./pages/Errors/Error404'));
const Error405 = lazy(() => import('./pages/Errors/Error405'));
const Error500 = lazy(() => import('./pages/Errors/Error500'));
const Error503 = lazy(() => import('./pages/Errors/Error503'));
//Páginas de usuario
const DashboardUsuario   = lazy(() => import('./pages/usuario/DashboardUsuario'));
const GraficasUsuario    = lazy(() => import('./pages/usuario/GraficasUsuario'));
const MiEstacionUsuario  = lazy(() => import('./pages/usuario/MiEstacionUsuario'));
const DescargarGraficas  = lazy(() => import('./pages/usuario/DescargarGraficas'));
const EditarPerfil       = lazy(() => import('./pages/usuario/EditarPerfil'));
const TablasDatosUsuario = lazy(() => import('./pages/usuario/TablasDatosUsuario'));

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
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
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
                <Route path="/usuario/perfil"         element={<UserRoute><Navigate to="/usuario/editar-perfil" replace /></UserRoute>} />
                <Route path="/usuario/editar-perfil"  element={<UserRoute><EditarPerfil /></UserRoute>} />
                <Route path="/usuario/tabla-datos"    element={<UserRoute><TablasDatosUsuario /></UserRoute>} />

                {/* Administrador — requieren rol ADMINISTRADOR o SUPERADMINISTRADOR */}
                <Route path="/admin/dashboard"    element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
                <Route path="/admin/usuarios"     element={<AdminRoute><UsuariosAdmin /></AdminRoute>} />
                <Route path="/admin/solicitudes"  element={<AdminRoute><SolicitudesAdmin /></AdminRoute>} />
                <Route path="/admin/historial"    element={<AdminRoute><HistorialAdmin /></AdminRoute>} />
                <Route path="/admin/perfil"          element={<AdminRoute><PerfilAdmin /></AdminRoute>} />
                <Route path="/admin/administradores" element={<AdminRoute><AdministradoresAdmin /></AdminRoute>} />
                <Route path="/admin/respaldo"        element={<AdminRoute><RespaldoAdmin /></AdminRoute>} />

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
        </Suspense>
    );
}

export default App;
