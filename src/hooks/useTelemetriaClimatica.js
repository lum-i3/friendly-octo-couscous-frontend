import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const PAGE_SIZE = 12;

/**
 * Obtiene datos de telemetría climática paginados.
 * GET /api/telemetria/climatica?page={pagina-1}&size=12
 *
 * Retorna:
 *   lecturas     → ClimateReadingDTO[]
 *   totalPaginas → number
 *   cargando     → boolean
 *   error        → string | null
 */
function useTelemetriaClimatica(pagina) {
    const [lecturas, setLecturas] = useState([]);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;

        setCargando(true);
        setError(null);

        fetch(`${BASE_URL}/api/telemetria/climatica?page=${pagina - 1}&size=${PAGE_SIZE}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then((json) => {
                if (!cancelado) {
                    const datos = json.datos ?? json;
                    setLecturas(datos.contenido ?? []);
                    setTotalPaginas(datos.totalPaginas ?? 0);
                    setCargando(false);
                }
            })
            .catch((err) => {
                if (!cancelado) {
                    setError(err.message);
                    setCargando(false);
                }
            });

        return () => { cancelado = true; };
    }, [pagina]);

    return { lecturas, totalPaginas, cargando, error };
}

export default useTelemetriaClimatica;
