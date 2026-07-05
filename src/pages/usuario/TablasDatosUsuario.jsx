import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import TableSectionTitle from '../../components/tabla/TableSectionTitle';
import TablaConFiltros from '../../components/tabla/TablaConFiltros';
import TablaFiltros from '../../components/tabla/TablaFiltros';
import TablePagination from '../../components/tabla/TablePagination';
import useTelemetriaClimaticaAuth from '../../hooks/useTelemetriaClimaticaAuth';
import useUserProfile from '../../hooks/useUserProfile';
import { USUARIO_ITEMS } from '../../utils/sidebarItems.jsx';
import '../../styles/tabla.css';

function computarRango() {
    const fin    = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    return {
        inicioISO: inicio.toISOString().slice(0, 19),
        finISO:    fin.toISOString().slice(0, 19),
    };
}

function TablasDatosUsuario() {
    const navigate = useNavigate();
    const { perfil } = useUserProfile();

    const [pagina, setPagina] = useState(1);
    const [orden, setOrden]   = useState('asc');
    const [columnas, setColumnas] = useState({
        temperatura: true,
        viento:      true,
        radiacion:   true,
        humedad:     true,
    });

    const { inicioISO, finISO } = useMemo(computarRango, []);

    const { lecturas, totalPaginas, cargando, error } =
        useTelemetriaClimaticaAuth({ inicioISO, finISO, pagina });

    const lecturasOrdenadas = useMemo(
        () => orden === 'desc' ? [...lecturas].reverse() : lecturas,
        [lecturas, orden]
    );

    const sidebarUser = perfil ? {
        nombre: perfil.nombreCompleto || perfil.nombreUsuario,
        foto:   perfil.fotoPerfil || null,
    } : null;

    function toggleColumna(key) {
        setColumnas(prev => ({ ...prev, [key]: !prev[key] }));
    }

    function toggleOrden() {
        setOrden(prev => prev === 'asc' ? 'desc' : 'asc');
    }

    function handleCambiarPagina(nuevaPagina) {
        setPagina(nuevaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={USUARIO_ITEMS}
                    user={sidebarUser}
                    titulo="Tabla de datos"
                    onBack={() => navigate(-1)}
                    onHome={() => navigate('/')}
                >
                    <div className="tabla-toolbar">
                        <TableSectionTitle titulo="Últimos datos registrados" />
                        <TablaFiltros
                            columnas={columnas}
                            onColumnaToggle={toggleColumna}
                            orden={orden}
                            onOrdenToggle={toggleOrden}
                        />
                    </div>

                    {cargando && (
                        <p className="tabla-ultimos__empty">Cargando datos…</p>
                    )}

                    {error && !cargando && (
                        <p className="tabla-ultimos__empty">{error}</p>
                    )}

                    {!cargando && !error && (
                        <>
                            <TablaConFiltros
                                lecturas={lecturasOrdenadas}
                                columnas={columnas}
                            />
                            {totalPaginas > 1 && (
                                <TablePagination
                                    currentPage={pagina}
                                    totalPages={totalPaginas}
                                    onPageChange={handleCambiarPagina}
                                />
                            )}
                        </>
                    )}
                </SidebarLayout>
            </div>
        </div>
    );
}

export default TablasDatosUsuario;
