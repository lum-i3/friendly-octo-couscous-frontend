import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function useUserProfile() {
    const [perfil, setPerfil] = useState(null);
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

        fetch(`${BASE_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then(json => {
                if (!cancelado) {
                    setPerfil(json.datos ?? null);
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
    }, []);

    return { perfil, cargando, error };
}

export default useUserProfile;
