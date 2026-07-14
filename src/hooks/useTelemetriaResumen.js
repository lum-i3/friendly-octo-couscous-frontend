import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Obtiene el resumen de telemetría del endpoint público.
 * GET /api/telemetria/resumen
 *
 * @param {number} refreshMs  Si > 0, refresca automáticamente cada refreshMs ms (sin skeleton).
 *
 * Retorna: datos, cargando, error, ultimaActualizacion
 */
function useTelemetriaResumen(refreshMs = 0) {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelado = false;
        if (tick === 0) setCargando(true);
        setError(null);

        fetch(`${BASE_URL}/api/telemetria/resumen`)
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then(json => {
                if (!cancelado) {
                    setDatos(json.datos ?? null);
                    setUltimaActualizacion(new Date());
                    setCargando(false);
                }
            })
            .catch(err => {
                if (!cancelado) {
                    setError(err.message);
                    setCargando(false);
                }
            });

        return () => { cancelado = true; };
    }, [tick]);

    useEffect(() => {
        if (!refreshMs || refreshMs <= 0) return;
        const id = setInterval(() => setTick(t => t + 1), refreshMs);
        return () => clearInterval(id);
    }, [refreshMs]);

    return { datos, cargando, error, ultimaActualizacion };
}

export default useTelemetriaResumen;
