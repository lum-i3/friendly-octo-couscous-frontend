import { useState } from 'react';
import OjoAbierto from '../assets/Icons/OjoAbierto.png';
import OjoCerrado from '../assets/Icons/OjoCerrado.png';
import '../styles/styles.css';

/**
 * Campo de formulario reutilizable: label (+ asterisco si es obligatorio),
 * hint opcional, input, y mensaje de error en rojo arriba del input.
 * Si type="password", agrega automáticamente el botón de mostrar/ocultar.
 */
function FormInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    required = false,
    error = '',
    placeholder = '',
    hint = '',
}) {
    const [verPassword, setVerPassword] = useState(false);
    const esPassword = type === 'password';
    const tipoReal = esPassword && verPassword ? 'text' : type;

    return (
        <div className="field">
            <div className="field-label-row">
                <label className="field-label" htmlFor={name}>
                    {label}{required && <span className="field-required"> *</span>}
                </label>
                {hint && <span className="field-hint">{hint}</span>}
            </div>

            {error && <p className="field-error-text">{error}</p>}

            <div className="field-input-wrapper">
                <input
                    id={name}
                    name={name}
                    type={tipoReal}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={`field-input ${esPassword ? 'field-input-password' : ''} ${error ? 'has-error' : ''}`}
                />
                {esPassword && (
                    <button
                        type="button"
                        className="field-toggle-visibility"
                        onClick={() => setVerPassword(!verPassword)}
                        aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <img src={verPassword ? OjoAbierto : OjoCerrado} alt="" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default FormInput;
