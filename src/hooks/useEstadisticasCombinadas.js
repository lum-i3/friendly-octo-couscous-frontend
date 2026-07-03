import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function useEstadisticasCombinadas(dias = 30) {
    const [stats, setStats] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            setCargando(false);
            return;
        }

        let cancelado = false;
        setCargando(true);
        setError(null);

        const fin    = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dias);

        const params = new URLSearchParams({
            inicio: inicio.toISOString().slice(0, 19),
            fin:    fin.toISOString().slice(0, 19),
        });

        fetch(`${BASE_URL}/api/estadisticas/electrica/combinada?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then(json => {
                if (!cancelado) {
                    setStats(json.datos ?? null);
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
    }, [dias]);

    return { stats, cargando, error };
}

export default useEstadisticasCombinadas;
