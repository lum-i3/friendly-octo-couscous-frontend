import '../styles/styles.css';

/**
 * Checkbox reutilizable con su label (ej. "Recordarme").
 */
function Checkbox({ label, name, checked, onChange, id }) {
    const checkboxId = id || name;

    return (
        <label className="checkbox-field" htmlFor={checkboxId}>
            <input
                type="checkbox"
                id={checkboxId}
                name={name}
                checked={checked}
                onChange={onChange}
            />
            <span>{label}</span>
        </label>
    );
}

export default Checkbox;
