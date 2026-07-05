import { Routes, Route, useNavigate } from 'react-router-dom';
//Páginas públicas
import DashboardVisitante from './pages/Public/DashboardVisitante';
import Login from './pages/Public/Login';
import FormRegistro from './pages/Public/FormRegistro';
import RecuperarContrasenia from './pages/Public/RecuperarContrasenia';
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
//Páginas de usuario (pendiente: proteger con guards de autenticación)
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
    return (
        <Routes>

            {/* Públicas */}
            <Route path="/"                       element={<DashboardVisitante />} />
            <Route path="/login"                  element={<Login />} />
            <Route path="/registro"               element={<FormRegistro />} />
            <Route path="/recuperar-contrasenia"  element={<RecuperarContrasenia />} />
            <Route path="/graficas"               element={<GraficasVisitanteRoute />} />
            <Route path="/tabla-datos"            element={<TablaDatosUsuario />} />

            {/* Usuario (pendiente: agregar guards de autenticación) */}
            <Route path="/usuario/dashboard"      element={<DashboardUsuario />} />
            <Route path="/usuario/graficas"       element={<GraficasUsuario />} />
            <Route path="/usuario/estacion"       element={<MiEstacionUsuario />} />
            <Route path="/usuario/descargar"      element={<DescargarGraficas />} />
            <Route path="/usuario/perfil"         element={<Perfil />} />
            <Route path="/usuario/editar-perfil"  element={<EditarPerfil />} />
            <Route path="/usuario/tabla-datos"    element={<TablasDatosUsuario />} />

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
