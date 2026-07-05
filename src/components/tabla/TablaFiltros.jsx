import { useState, useEffect, useRef } from 'react';
import '../../styles/tabla.css';

const COLUMNA_LABELS = {
    temperatura: 'Temperatura',
    viento:      'Viento',
    radiacion:   'Radiación',
    humedad:     'Humedad',
};

function TablaFiltros({ columnas, onColumnaToggle, orden, onOrdenToggle }) {
    const [abierto, setAbierto] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickFuera(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setAbierto(false);
            }
        }
        if (abierto) document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, [abierto]);

    const columnasOcultas = Object.values(columnas).filter(v => !v).length;

    return (
        <div className="tabla-filtros" ref={wrapperRef}>
            <button
                className="tabla-filtros-btn"
                onClick={() => setAbierto(p => !p)}
                type="button"
            >
                {columnasOcultas > 0 && (
                    <span className="tabla-filtros-btn__badge">({columnasOcultas})</span>
                )}
                Filtros ▼
            </button>

            <button
                className="tabla-orden-btn"
                onClick={onOrdenToggle}
                type="button"
            >
                {orden === 'asc' ? 'Ascendente ▲' : 'Descendente ▼'}
            </button>

            {abierto && (
                <div className="tabla-filtros-panel">
                    {Object.entries(columnas).map(([key, visible]) => (
                        <label key={key} className="tabla-filtros-opcion">
                            <input
                                type="checkbox"
                                checked={visible}
                                onChange={() => onColumnaToggle(key)}
                            />
                            {COLUMNA_LABELS[key]}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TablaFiltros;
