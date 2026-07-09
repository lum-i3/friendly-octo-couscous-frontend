import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function fetchCount(estado, token) {
    const qs = estado ? `?estado=${estado}&size=1` : '?size=1';
    const res = await fetch(`${BASE_URL}/api/admin/usuarios${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json.datos?.totalElementos ?? 0;
}

async function fetchHistorial(token) {
    const res = await fetch(`${BASE_URL}/api/admin/historial?size=8`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.datos?.contenido ?? [];
}

function useAdminSummary() {
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }

        let cancelado = false;
        setCargando(true);

        Promise.all([
            fetchCount(null, token).catch(() => 0),
            fetchCount('ACTIVO', token).catch(() => 0),
            fetchCount('BLOQUEADO', token).catch(() => 0),
            fetchCount('SIN_CONFIRMAR', token).catch(() => 0),
            fetchCount('INACTIVO', token).catch(() => 0),
            fetchHistorial(token).catch(() => []),
        ]).then(([total, activos, bloqueados, sinConfirmar, inactivos, historial]) => {
            if (!cancelado) {
                setResumen({ total, activos, bloqueados, sinConfirmar, inactivos, historial });
                setCargando(false);
            }
        });

        return () => { cancelado = true; };
    }, []);

    return { resumen, cargando };
}

export default useAdminSummary;
