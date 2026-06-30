import '../styles/sidebar.css';

function ContentHeaderTitle({ titulo }) {
    if (!titulo) return null;
    return <div className="content-header__title">{titulo}</div>;
}

export default ContentHeaderTitle;
