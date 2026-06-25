import '../styles/styles.css';

/**
 * variant: 'primary' | 'secondary' | 'outline'
 * size:    'md' | 'sm'
 * full:    boolean
 */
function Button({ children, onClick, variant = 'primary', size = 'md', full = false, className = '', style = {}, disabled = false, type = 'button' }) {
    const cls = [
        'btn',
        `btn-${variant}`,
        size === 'sm' ? 'btn-sm' : '',
        full ? 'btn-full' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={cls} onClick={onClick} style={style} disabled={disabled} type={type}>
            {children}
        </button>
    );
}

export default Button;
