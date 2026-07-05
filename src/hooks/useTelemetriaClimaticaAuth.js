import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 12;

function useTelemetriaClimaticaAuth({ inicioISO, finISO, pagina }) {
    const [lecturas, setLecturas] = useState([]);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            setCargando(false);
            setError('Sin sesión activa.');
            return;
        }

        let cancelado = false;
        setCargando(true);
        setError(null);

        const params = new URLSearchParams({
            inicio: inicioISO,
            fin:    finISO,
            page:   pagina - 1,
            size:   PAGE_SIZE,
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
                    setTotalPaginas(datos.totalPaginas ?? 0);
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
    }, [inicioISO, finISO, pagina]);

    return { lecturas, totalPaginas, cargando, error };
}

export default useTelemetriaClimaticaAuth;
