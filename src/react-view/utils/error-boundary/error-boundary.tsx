import React, { PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { getGlobalLogger } from '../logger/logger.context';

const Fallback: React.FC<FallbackProps> = ({ error }) => {
    if (error instanceof Error) {
        return (
            <div role="alert">
                <p>Something went wrong:</p>
                <pre style={{ color: 'red' }}>{error.message}</pre>
                <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return (
            <div role="alert">
                <h1> An unknown alert was raised</h1>
            </div>
        );
    }
};

const MyErrorBoundary: React.FC<PropsWithChildren> = ({ children }) => {
    const logger = getGlobalLogger();
    return (
        <ErrorBoundary
            FallbackComponent={Fallback}
            onError={info => {
                logger.error('Unhandled error', info);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default MyErrorBoundary;
