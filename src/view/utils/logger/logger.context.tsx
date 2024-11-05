import EventEmitter from 'events';
import React, { PropsWithChildren } from 'react';

import { Logger } from './logger.class';
import { ILogger } from './logger.types';

interface LoggerContext {
    eventEmitter: EventEmitter;
    logger: ILogger;
}

const loggerEmitter = new EventEmitter();

const loggerContext = React.createContext<LoggerContext>({
    logger: new Logger(loggerEmitter),
    eventEmitter: loggerEmitter,
});

export const useLogger = () => React.useContext(loggerContext).logger;
export const useLoggerEmitter = () => React.useContext(loggerContext).eventEmitter;

export const ProvideLogger: React.FC<PropsWithChildren> = ({ children }) => {
    const { Provider } = loggerContext;
    const logger = new Logger(loggerEmitter);

    return <Provider value={{ logger, eventEmitter: loggerEmitter }}>{children}</Provider>;
};
