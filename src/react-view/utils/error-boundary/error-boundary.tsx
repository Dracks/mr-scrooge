/* eslint-disable @typescript-eslint/ban-types */
import React, { ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { getGlobalLogger } from '../logger/logger.context';
import { ReactChildren } from '../react-children';

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: 'red' }}>{error.message}</pre>
            <pre>{error.stack}</pre>
        </div>
    );
};

const MyErrorBoundary: React.FC<ReactChildren> = ({ children }) => {
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
