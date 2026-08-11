import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    // Calcula el origen del backend para inyectarlo en connect-src del CSP.
    // Si VITE_API_URL está vacío (proxy nginx en mismo origen), deja 'self'.
    let connectSrc = "'self'"
    if (env.VITE_API_URL) {
        try {
            const origin = new URL(env.VITE_API_URL).origin
            connectSrc = `'self' ${origin}`
        } catch {
            console.warn('[vite] VITE_API_URL no es una URL válida — connect-src queda como "self"')
        }
    }

    return {
        plugins: [
            react(),
            {
                // Reemplaza connect-src en el meta CSP con el origen real de la API.
                // En build con mismo origen (VITE_API_URL vacío): sin cambio.
                // En build con dominio separado: añade ese dominio automáticamente.
                name: 'csp-connect-src',
                transformIndexHtml: (html) =>
                    html.replace("connect-src 'self'", `connect-src ${connectSrc}`),
            },
        ],
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:8085',
                    changeOrigin: true,
                },
            },
        },
    }
})
