import { Component } from 'react';
import Error500 from '../pages/Errors/Error500';

class ErrorBoundary extends Component {
    state = { tieneError: false };

    static getDerivedStateFromError() {
        return { tieneError: true };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Error no capturado:', error, info?.componentStack);
    }

    render() {
        if (this.state.tieneError) {
            return <Error500 />;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
