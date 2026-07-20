// Expresiones regulares de validación, alineadas con los DTOs del backend
// (RegisterRequestDTO, ResetPasswordRequestDTO) para mantener mensajes consistentes.
export const REGEX_USUARIO = /^[a-zA-Z0-9._-]+$/;
export const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?: [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/;
export const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;
export const REGEX_CODIGO_RECUPERACION = /^\d{6}$/;
