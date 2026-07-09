import '../styles/styles.css';

/**
 * variant: 'primary' | 'secondary' | 'outline'
 * size:    'md' | 'sm'
 * full:    boolean
 * loading: boolean — shows spinner and keeps button color while disabled
 */
function Button({ children, onClick, variant = 'primary', size = 'md', full = false, className = '', style = {}, disabled = false, loading = false, type = 'button' }) {
    const cls = [
        'btn',
        `btn-${variant}`,
        size === 'sm' ? 'btn-sm' : '',
        full ? 'btn-full' : '',
        loading ? 'btn-loading' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={cls} onClick={onClick} style={style} disabled={disabled || loading} type={type}>
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            {children}
        </button>
    );
}

export default Button;
