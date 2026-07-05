import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos sin interacción
const EVENTOS = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];

/**
 * Cierra la sesión del usuario después de TIMEOUT_MS de inactividad.
 * @param {boolean} activo  - true cuando hay sesión abierta
 * @param {Function} onTimeout - callback que se llama al vencer el tiempo
 */
function useInactividadSesion(activo, onTimeout) {
    const timerRef = useRef(null);

    const resetear = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(onTimeout, TIMEOUT_MS);
    }, [onTimeout]);

    useEffect(() => {
        if (!activo) return;

        EVENTOS.forEach(ev => window.addEventListener(ev, resetear, { passive: true }));
        resetear();

        return () => {
            EVENTOS.forEach(ev => window.removeEventListener(ev, resetear));
            clearTimeout(timerRef.current);
        };
    }, [activo, resetear]);
}

export default useInactividadSesion;
