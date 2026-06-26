import SepLogo from '../assets/Logos/SEP_Logo.png';
import TecNMLogo from '../assets/Logos/TecNM_logo.png';
import CenidetLogo from '../assets/Logos/Logo_cenidet.png';
import '../styles/styles.css';

// TODO: reemplazar estos "#" por las URLs reales de cada institución.
const LOGOS = [
    { src: SepLogo, alt: 'Secretaría de Educación Pública', href: '#' },
    { src: TecNMLogo, alt: 'Tecnológico Nacional de México', href: '#' },
    { src: CenidetLogo, alt: 'CENIDET', href: '#' },
];

/**
 * Cabecera institucional reutilizable, presente en todas las pantallas.
 */
function Header() {
    return (
        <header className="app-header">
            <div className="app-header-logos">
                {LOGOS.map(({ src, alt, href }) => (
                    <a
                        key={alt}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-header-logo-link"
                        aria-label={alt}
                    >
                        <img src={src} alt={alt} className="app-header-logo" />
                    </a>
                ))}
            </div>
        </header>
    );
}

export default Header;
