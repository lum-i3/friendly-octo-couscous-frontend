import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * @param {string} inicioISO  "YYYY-MM-DDTHH:mm:ss"
 * @param {string} finISO     "YYYY-MM-DDTHH:mm:ss"
 * @param {number} size       Máximo de registros (default 600)
 */
function useHistoricoClimatica(inicioISO, finISO, size = 600) {
    const [lecturas, setLecturas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token || !inicioISO || !finISO) { setCargando(false); return; }

        let cancelado = false;
        setCargando(true);
        setError(null);

        const params = new URLSearchParams({
            inicio: inicioISO,
            fin:    finISO,
            page:   '0',
            size:   String(size),
        });

        fetch(`${BASE_URL}/api/telemetria/climatica?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then(json => {
                if (!cancelado) {
                    const datos = json.datos ?? json;
                    setLecturas(datos.contenido ?? []);
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
    }, [inicioISO, finISO, size]);

    return { lecturas, cargando, error };
}

export default useHistoricoClimatica;
