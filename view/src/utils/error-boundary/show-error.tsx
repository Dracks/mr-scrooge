import React, { ErrorInfo } from 'react';

import ErrorScreen from './error-screen';
import {DEBUG} from '../../constants';
import { useLogger } from '../logger/logger.context';

interface ShowErrorProps {
    error: Error;
    info?: ErrorInfo;
}

const ShowError: React.FC<ShowErrorProps> = ({ error, info }) => {

    
    const logger = useLogger()
     
    logger.error({
         msg: "React error",
         error,
         info,
    })

    if (DEBUG) {
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
