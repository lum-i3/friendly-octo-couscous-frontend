import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/**
 * Obtiene el resumen de telemetría del endpoint público.
 * GET /api/telemetria/resumen
 *
 * Retorna:
 *   datos     → LatestSummaryDTO con ultimaLecturaClimatica, ultimaLecturaFotovoltaica,
 *               ultimaLecturaEolica, datosEnTiempoReal, timestampConsulta
 *   cargando  → boolean
 *   error     → string | null
 */
function useTelemetriaResumen() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;

        setCargando(true);
        setError(null);

        fetch(`${BASE_URL}/api/telemetria/resumen`)
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then((json) => {
                if (!cancelado) {
                    setDatos(json.datos ?? null);
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
    }, []);

    return { datos, cargando, error };
}

export default useTelemetriaResumen;
