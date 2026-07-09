import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function fetchStats(inicio, fin, token) {
    const params = new URLSearchParams({
        inicio: inicio.toISOString().slice(0, 19),
        fin:    fin.toISOString().slice(0, 19),
    });
    const res = await fetch(`${BASE_URL}/api/estadisticas/climatica?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.datos ?? null;
}

function useResumenClimatico() {
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }

        let cancelado = false;
        setCargando(true);

        const ahora   = new Date();
        const hoyIni  = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
        const hoyFin  = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        const ayerIni = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1, 0, 0, 0);
        const ayerFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1, 23, 59, 59);
        const semanaIni = new Date(ahora); semanaIni.setDate(ahora.getDate() - 7);
        const mesIni    = new Date(ahora); mesIni.setDate(ahora.getDate() - 30);
        const anioIni   = new Date(ahora); anioIni.setFullYear(ahora.getFullYear() - 1);

        Promise.all([
            fetchStats(hoyIni, hoyFin, token).catch(() => null),
            fetchStats(ayerIni, ayerFin, token).catch(() => null),
            fetchStats(semanaIni, ahora, token).catch(() => null),
            fetchStats(mesIni, ahora, token).catch(() => null),
            fetchStats(anioIni, ahora, token).catch(() => null),
        ]).then(([hoy, ayer, semana, mes, anio]) => {
            if (!cancelado) {
                setResumen({ hoy, ayer, semana, mes, anio });
                setCargando(false);
            }
        });

        return () => { cancelado = true; };
    }, []);

    return { resumen, cargando };
}

export default useResumenClimatico;
