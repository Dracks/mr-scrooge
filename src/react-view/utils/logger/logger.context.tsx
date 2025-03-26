import EventEmitter from 'events';
import React, { PropsWithChildren } from 'react';

import { Logger } from './logger.class';
import { ILogger } from './logger.types';

interface LoggerContext {
    eventEmitter: EventEmitter;
    logger: ILogger;
}

const loggerEmitter = new EventEmitter();
loggerEmitter.on('error', (...data) => {
    console.error('Error on event emitter', data);
});

const loggerContext = React.createContext<LoggerContext>({
    logger: new Logger(loggerEmitter),
    eventEmitter: loggerEmitter,
});

export const useLogger = (ctx?: string) => {
    const context = React.useContext(loggerContext);
    if (ctx) {
        return new Logger(context.eventEmitter, ctx);
    }
    return context.logger;
};
export const useLoggerEmitter = () => React.useContext(loggerContext).eventEmitter;

export const ProvideLogger: React.FC<PropsWithChildren> = ({ children }) => {
    const { Provider } = loggerContext;
    const logger = new Logger(loggerEmitter);

    return <Provider value={{ logger, eventEmitter: loggerEmitter }}>{children}</Provider>;
};

export const getGlobalLogger = (ctx?: string) => new Logger(loggerEmitter, ctx);
