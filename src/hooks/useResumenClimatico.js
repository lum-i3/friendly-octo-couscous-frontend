import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function useResumenClimatico() {
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }

        let cancelado = false;
        setCargando(true);
        setError(false);

        fetch(`${BASE_URL}/api/estadisticas/climatica/resumen`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Error del servidor')))
            .then(json => {
                if (!cancelado) {
                    setResumen(json?.datos ?? null);
                    setCargando(false);
                }
            })
            .catch(() => {
                if (!cancelado) { setCargando(false); setError(true); }
            });

        return () => { cancelado = true; };
    }, []);

    return { resumen, cargando, error };
}

export default useResumenClimatico;
