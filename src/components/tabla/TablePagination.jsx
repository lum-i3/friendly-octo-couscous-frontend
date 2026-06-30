import PaginationButton from './PaginationButton';
import '../../styles/tabla.css';

/**
 * Construye el array de páginas a mostrar con elipsis donde hay saltos.
 * Ejemplo (currentPage=1, totalPages=10): [1, 2, 3, '...', 10]
 * Ejemplo (currentPage=5, totalPages=10): [1, '...', 4, 5, 6, '...', 10]
 */
function buildPageRange(currentPage, totalPages) {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set([1, totalPages]);

    // Ventana alrededor de la página actual
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.add(i);

    // Mostrar al menos 3 páginas al inicio o al final cuando estamos cerca
    if (currentPage <= 2) { pages.add(2); pages.add(3); }
    if (currentPage >= totalPages - 1) { pages.add(totalPages - 1); pages.add(totalPages - 2); }

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        result.push(sorted[i]);
        if (i + 1 < sorted.length && sorted[i + 1] - sorted[i] > 1) {
            result.push('...');
        }
    }
    return result;
}

/**
 * Props:
 *   currentPage  — página actual (1-indexed para la UI; el backend usa 0-indexed)
 *   totalPages   — total de páginas (response.data.totalPaginas del backend)
 *   onPageChange — (page: number) => void  (recibe 1-indexed)
 */
function TablePagination({ currentPage = 1, totalPages = 1, onPageChange }) {
    const pages = buildPageRange(currentPage, totalPages);

    function handleChange(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    }

    return (
        <nav className="tabla-paginacion" aria-label="Paginación de tabla">
            <PaginationButton
                variant="prev"
                onClick={() => handleChange(currentPage - 1)}
                disabled={currentPage === 1}
            />

            {pages.map((page, idx) =>
                page === '...' ? (
                    <PaginationButton key={`ellipsis-${idx}`} variant="ellipsis" />
                ) : (
                    <PaginationButton
                        key={page}
                        label={page}
                        isActive={page === currentPage}
                        onClick={() => handleChange(page)}
                    />
                )
            )}

            <PaginationButton
                variant="next"
                onClick={() => handleChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
        </nav>
    );
}

export default TablePagination;
