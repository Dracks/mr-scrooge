import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';
import MyErrorBoundary from './utils/error-boundary/error-boundary';
import AllProviders from './utils/providers';

// Render react
window.onload = (): void => {
    const container = document.getElementById('body');
    if (container) {
        const root = createRoot(container); // createRoot(container!) if you use TypeScript
        root.render(
            <MyErrorBoundary>
                <AllProviders>
                    <App />
                </AllProviders>
            </MyErrorBoundary>,
        );
    }
};
