import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';
import ErrorBoundary from './utils/error-boundary/error-boundary';
import AllProviders from './utils/providers';

// Render react
window.onload = (): void => {
    ReactDOM.render(
        <AllProviders>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AllProviders>,
        document.getElementById('body'),
    );
};
