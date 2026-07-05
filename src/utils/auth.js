/**
 * Verifica si el JWT almacenado en localStorage existe y no ha expirado.
 * Decodifica el payload del token sin necesidad de la clave secreta.
 */
export function isTokenValid() {
    const token = localStorage.getItem('jwt');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function cerrarSesion() {
    localStorage.removeItem('jwt');
}
