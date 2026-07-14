import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * @param {string} fuente  'FOTOVOLTAICO' | 'EOLICO'
 * @param {number} dias    Ventana de tiempo hacia atrás (default 7)
 * @param {number} size    Máximo de registros a pedir al backend (default 500)
 */
function useHistoricoElectrica(fuente, dias = 7, size = 500) {
    const [lecturas, setLecturas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) { setCargando(false); return; }

        let cancelado = false;
        setCargando(true);
        setError(null);

        const fin    = new Date();
        const inicio = new Date();
        inicio.setDate(inicio.getDate() - dias);

        const params = new URLSearchParams({
            inicio: inicio.toISOString().slice(0, 19),
            fin:    fin.toISOString().slice(0, 19),
            fuente,
            page:   '0',
            size:   String(size),
        });

        fetch(`${BASE_URL}/api/telemetria/electrica?${params}`, {
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
    }, [fuente, dias, size]);

    return { lecturas, cargando, error };
}

export default useHistoricoElectrica;
