# AWSHEF — Frontend

> **Sistema de Monitoreo de Variables Climáticas y Eléctricas**
> **Centro Nacional de Investigación y Desarrollo Tecnológico — CENIDET**

---

## Equipo de Desarrollo

| Nombre Completo | Rol / Tareas Principales | Usuario GitHub |
| :--- | :--- | :--- |
| Ian Alejandro Rivera Torres | Arquitectura, Frontend, Diseño UI | @IanRT08 |

---

## Descripción del Proyecto

**¿Qué hace el sistema?**

El frontend es una aplicación web de página única (SPA) que presenta en tiempo real los datos del sistema híbrido eólico-fotovoltaico de CENIDET. Sus funcionalidades principales son:

- Mostrar un **dashboard público** con las lecturas climáticas y eléctricas más recientes, accesible sin necesidad de iniciar sesión.
- Visualizar **gráficas interactivas** de series de tiempo para todas las variables (temperatura, viento, humedad, radiación, presión, voltaje, corriente, potencia, Voc, energía) con selector de intervalo y navegación entre períodos.
- Presentar una **tabla pública** con registros históricos anteriores al mes en curso, con paginación.
- Ofrecer a usuarios autenticados vistas ampliadas con estadísticas detalladas, selector de rango personalizado y una vista combinada del sistema híbrido (eólico + fotovoltaico).
- Permitir la **descarga de reportes** en formato PDF y Excel a usuarios con permiso activo, con selección de variables, rango de fechas y tipo de reporte.
- Proporcionar un **panel de administración** completo para gestión de usuarios, aprobación o rechazo de solicitudes de descarga, consulta del historial de acciones, gestión de administradores y control del respaldo histórico de datos.
- Gestionar el ciclo completo de **autenticación**: registro, confirmación por OTP, inicio de sesión, recuperación de contraseña y desactivación voluntaria de cuenta.

**Objetivo:**

Automatizar y optimizar el análisis de variables climáticas y eléctricas de un sistema híbrido eólico-fotovoltaico, mediante el desarrollo de una aplicación web que centralice la información para su monitoreo y visualización en tiempo real.

---

## Stack Tecnológico y Características

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| React | 19.2.5 | Biblioteca principal de UI |
| Vite | 8.0.10 | Bundler y servidor de desarrollo |
| JavaScript (ES Modules) | — | Lenguaje principal |
| React Router DOM | 7.18.0 | Enrutamiento del lado del cliente (SPA) |
| Bootstrap | 5.3.8 | Sistema de grillas y componentes base |
| React Bootstrap | 2.10.10 | Componentes Bootstrap adaptados para React |
| Chart.js | 4.5.1 | Motor de gráficas |
| react-chartjs-2 | 5.3.1 | Integración de Chart.js con React |
| Leaflet + react-leaflet | 1.9.4 / 5.0.0 | Mapas interactivos |
| SweetAlert2 | 11.26.25 | Diálogos y notificaciones de respuesta del servidor |
| ESLint | 10.2.1 | Análisis estático de código |

### Rutas y Páginas

La aplicación cuenta con tres grupos de rutas protegidas por guardias de navegación:

**Públicas** — accesibles sin autenticación

| Ruta | Página | Descripción |
| :--- | :--- | :--- |
| `/` | Dashboard Visitante | Última lectura climática y eléctrica disponible, con indicadores de estado del sistema |
| `/graficas` | Gráficas Visitante | Visualización de series de tiempo climáticas con selector de intervalo |
| `/tabla-datos` | Tabla de Datos | Registros históricos paginados anteriores al mes en curso |
| `/login` | Inicio de Sesión | Formulario de autenticación con JWT |
| `/registro` | Registro | Creación de nueva cuenta de usuario |
| `/verificar-cuenta` | Verificar Cuenta | Confirmación de cuenta mediante código OTP enviado por correo |
| `/recuperar-contrasenia` | Recuperar Contraseña | Flujo de tres pasos: solicitar código, validar OTP, establecer nueva contraseña |

**Usuario autenticado** — requieren sesión activa con rol `USUARIO`

| Ruta | Página | Descripción |
| :--- | :--- | :--- |
| `/usuario/dashboard` | Dashboard Usuario | Dashboard enriquecido con resumen estadístico de cinco períodos |
| `/usuario/graficas` | Gráficas Usuario | Gráficas climáticas y eléctricas con selector de rango personalizado y estadísticas |
| `/usuario/estacion` | Mi Estación | Vista combinada del sistema híbrido (fotovoltaico + eólico) con estadísticas agregadas |
| `/usuario/descargar` | Descargar Reportes | Generación y descarga de reportes en PDF y Excel con selección de variables |
| `/usuario/tabla-datos` | Tabla de Datos | Tabla paginada con acceso al historial completo |
| `/usuario/perfil` | Perfil | Datos del perfil, solicitudes de descarga y opción de desactivar cuenta |
| `/usuario/editar-perfil` | Editar Perfil | Actualización de datos personales y foto de perfil |

**Administración** — requieren sesión activa con rol `ADMINISTRADOR` o `SUPERADMINISTRADOR`

| Ruta | Página | Descripción |
| :--- | :--- | :--- |
| `/admin/dashboard` | Dashboard Admin | Monitoreo en tiempo real del estado de sincronización y alertas del sistema |
| `/admin/usuarios` | Gestión de Usuarios | Listado paginado y filtrable, cambio de estado, permiso de descarga directo |
| `/admin/solicitudes` | Solicitudes | Revisión y resolución de solicitudes de permiso de descarga |
| `/admin/historial` | Historial de Acciones | Auditoría completa de acciones por usuario y por fecha |
| `/admin/administradores` | Administradores | Gestión de cuentas de administrador *(solo superadministrador)* |
| `/admin/respaldo` | Respaldo Histórico | Control del proceso de importación histórica de datos por fuente |
| `/admin/perfil` | Perfil Admin | Datos del perfil del administrador autenticado |

**Páginas de error:** 400, 401, 403, 404, 405, 500, 503

### Autenticación y protección de rutas

El token JWT recibido del backend se persiste en `localStorage`. Tres componentes guardián (`PublicOnlyRoute`, `UserRoute`, `AdminRoute`) evalúan el token al cargar cada ruta: redirigen al login si no hay sesión activa, o al dashboard correspondiente según el rol si el usuario ya está autenticado e intenta acceder a una ruta pública. Las respuestas de error del servidor (401, 403, 500, etc.) son interceptadas globalmente y redirigen a la página de error correspondiente.

---

## Capturas de Pantalla

*(Sección pendiente)*

---

## Instalación

*(Sección pendiente)*
