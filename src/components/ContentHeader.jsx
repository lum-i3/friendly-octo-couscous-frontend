import ContentHeaderTitle from './ContentHeaderTitle';
import NavBackBtn from './NavBackBtn';
import NavHomeBtn from './NavHomeBtn';
import '../styles/sidebar.css';

function ContentHeader({ titulo, onBack, onHome, actions }) {
    return (
        <div className="content-header">
            <ContentHeaderTitle titulo={titulo} />
            <div className="content-header__actions">
                {actions}
                {onBack && <NavBackBtn onClick={onBack} />}
                {onHome && <NavHomeBtn onClick={onHome} />}
            </div>
        </div>
    );
}

export default ContentHeader;
