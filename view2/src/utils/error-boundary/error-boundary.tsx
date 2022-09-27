import React, { ErrorInfo } from 'react';

import ShowError from './show-error';

interface ErrorBoundaryState {
    error?: Error;
    info?: ErrorInfo;
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, info: errorInfo });
    }

    render() {
        if (this.state.error) {
            // You can render any custom fallback UI
            const { error, info } = this.state;
            return <ShowError error={error} info={info} />;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
