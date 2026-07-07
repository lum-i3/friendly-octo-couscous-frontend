import '../styles/styles.css';

function FormTextarea({
    label,
    name,
    value,
    onChange,
    onBlur,
    required = false,
    error = '',
    placeholder = '',
    hint = '',
    maxLength,
    rows = 5,
}) {
    return (
        <div className="field">
            <div className="field-label-row">
                <label className="field-label" htmlFor={name}>
                    {label}{required && <span className="field-required"> *</span>}
                </label>
                {hint && <span className="field-hint">{hint}</span>}
            </div>
            {error && <p className="field-error-text">{error}</p>}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                className={`field-input field-textarea${error ? ' has-error' : ''}`}
            />
        </div>
    );
}

export default FormTextarea;
