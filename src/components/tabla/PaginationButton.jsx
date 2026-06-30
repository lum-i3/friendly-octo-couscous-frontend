import PaginacionBack from '../../assets/Icons/PaginacionBack.png';
import PaginacionNext from '../../assets/Icons/PaginacionNext.png';

/**
 * variant: 'number' | 'prev' | 'next' | 'ellipsis'
 *   number   — muestra el número de página
 *   prev     — flecha izquierda (página anterior)
 *   next     — flecha derecha (página siguiente)
 *   ellipsis — puntos suspensivos no clicables
 */
function PaginationButton({
    label,
    onClick,
    isActive = false,
    disabled = false,
    variant = 'number',
}) {
    const cls = [
        'tabla-paginacion__btn',
        isActive                              ? 'tabla-paginacion__btn--active'   : '',
        variant === 'prev' || variant === 'next' ? 'tabla-paginacion__btn--arrow' : '',
        variant === 'ellipsis'                ? 'tabla-paginacion__btn--ellipsis' : '',
    ].filter(Boolean).join(' ');

    const isEllipsis = variant === 'ellipsis';

    return (
        <button
            className={cls}
            onClick={isEllipsis ? undefined : onClick}
            disabled={disabled || isEllipsis}
            aria-current={isActive ? 'page' : undefined}
            aria-label={
                variant === 'prev' ? 'Página anterior'
                : variant === 'next' ? 'Página siguiente'
                : undefined
            }
        >
            {variant === 'prev' && <img src={PaginacionBack} alt="Anterior" />}
            {variant === 'next' && <img src={PaginacionNext} alt="Siguiente" />}
            {variant === 'ellipsis' && '...'}
            {variant === 'number' && label}
        </button>
    );
}

export default PaginationButton;
