import { useState } from 'react';
import Header from '../../components/Header';
import SidebarLayout from '../../components/SidebarLayout';
import TableSectionTitle from '../../components/tabla/TableSectionTitle';
import UltimosDataTable from '../../components/tabla/UltimosDataTable';
import TablePagination from '../../components/tabla/TablePagination';
import { VISITANTE_ITEMS } from '../../utils/sidebarItems';
import useTelemetriaClimatica from '../../hooks/useTelemetriaClimatica';
import '../../styles/dashboard.css';

function TablaDatosUsuario() {
    const [currentPage, setCurrentPage] = useState(1);
    const { lecturas, totalPaginas, cargando, error } = useTelemetriaClimatica(currentPage);

    return (
        <div className="page-with-header">
            <Header />
            <div className="page-with-header__body">
                <SidebarLayout
                    navItems={VISITANTE_ITEMS}
                    defaultActiveKey="tabla"
                    titulo="Tablas de datos"
                >
                    <TableSectionTitle />

                    {cargando && (
                        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.9rem' }}>
                            Cargando datos...
                        </p>
                    )}

                    {!cargando && error && (
                        <div className="dashboard-error">
                            <span>No se pudieron cargar los datos.</span>
                            <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{error}</span>
                        </div>
                    )}

                    {!cargando && !error && (
                        <>
                            <UltimosDataTable lecturas={lecturas} />
                            {totalPaginas > 1 && (
                                <TablePagination
                                    currentPage={currentPage}
                                    totalPages={totalPaginas}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </SidebarLayout>
            </div>
        </div>
    );
}

export default TablaDatosUsuario;
