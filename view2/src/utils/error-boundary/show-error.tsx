import React, { ErrorInfo } from 'react';

import DebugContext from '../debug/context';
import ErrorScreen from './error-screen';

interface ShowErrorProps {
    error: Error;
    info?: ErrorInfo;
}

const ShowError: React.FC<ShowErrorProps> = ({ error, info }) => {
    const isDebug = React.useContext(DebugContext);
    /*
     *const logger = useLogger()
     *
     *logger.error({
     *    msg: "React error",
     *    error,
     *    info,
     *})
     */
    if (!isDebug) {
        return <ErrorScreen />;
    }
    return (
        <div>
            <h1>{error.message}</h1>
            <pre>{error.stack}</pre>
            <pre>{info && info.componentStack}</pre>
        </div>
    );
};

export default ShowError;
