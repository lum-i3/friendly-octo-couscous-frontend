const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function extraerMensaje(res) {
    try {
        const data = await res.json();
        return data.mensaje || data.message || data.error || `Error ${res.status}`;
    } catch {
        return `Error ${res.status}: ${res.statusText}`;
    }
}

export async function login(correo, contrasenia) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasenia }),
    });
    if (!res.ok) throw new Error(await extraerMensaje(res));
    return res.json();
}

export async function registrar(datos) {
    // datos: { nombreUsuario, correo, nombreCompleto, contrasenia, confirmarContrasenia }
    const res = await fetch(`${BASE_URL}/api/auth/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error(await extraerMensaje(res));
    return res.json();
}

export async function forgotPassword(correo) {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
    });
    if (!res.ok) throw new Error(await extraerMensaje(res));
    return res.json();
}

export async function resetPassword(datos) {
    // datos: { correo, codigo, nuevaContrasenia, confirmarContrasenia }
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error(await extraerMensaje(res));
    return res.json();
}
