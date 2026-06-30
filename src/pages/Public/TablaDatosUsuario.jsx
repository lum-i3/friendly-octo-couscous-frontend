import { useState } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import TableSectionTitle from '../../components/tabla/TableSectionTitle';
import UltimosDataTable from '../../components/tabla/UltimosDataTable';
import TablePagination from '../../components/tabla/TablePagination';
import { VISITANTE_ITEMS } from '../../utils/sidebarItems';

const PAGE_SIZE = 12;

// Datos mock — reemplazar con llamada a:
// GET /api/telemetria/climatica?inicio=...&fin=...&page={page-1}&size=12
// response.data  →  { contenido, paginaActual, totalPaginas, totalElementos, esPrimera, esUltima }
const MOCK_LECTURAS = Array.from({ length: PAGE_SIZE }, (_, i) => ({
    idLectura: i + 1,
    fechaLectura: '2026-05-21T11:34:00',
    temperatura: 28,
    viento: 2,
    radiacion: 8,
    humedad: 41.8,
}));

const MOCK_TOTAL_PAGINAS = 10;

function TablaDatosUsuario() {
    const [currentPage, setCurrentPage] = useState(1);

    // Al conectar el backend, aquí irá el fetch que depende de currentPage:
    // useEffect(() => { fetchLecturas(currentPage - 1, PAGE_SIZE); }, [currentPage]);
    const lecturas = MOCK_LECTURAS;
    const totalPaginas = MOCK_TOTAL_PAGINAS;

    return (
        <SidebarLayout
            navItems={VISITANTE_ITEMS}
            defaultActiveKey="tabla"
            titulo="Tablas de datos"
        >
            <TableSectionTitle />

            <UltimosDataTable lecturas={lecturas} />

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPaginas}
                onPageChange={setCurrentPage}
            />
        </SidebarLayout>
    );
}

export default TablaDatosUsuario;
