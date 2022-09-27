import React from 'react';

import { useLoggerEmitter } from './logger.context';
import { LogEvent, LoggerArguments, LogLevel } from './logger.types';
import { LogLevelToNumber } from './logger.utils';

export const LoggerConsole: React.FC<LoggerArguments> = ({ children, logLevel }) => {
    const eventEmitter = useLoggerEmitter();
    const levelNum = LogLevelToNumber[logLevel];
    if (levelNum <= LogLevelToNumber[LogLevel.info]) {
        eventEmitter.on(LogLevel.info, (data: LogEvent) => {
            console.log(`[${new Date()}]: ${data.msg}`, data.data);
        });
    }

    if (levelNum <= LogLevelToNumber[LogLevel.warn]) {
        eventEmitter.on(LogLevel.warn, (data: LogEvent) => {
            console.warn(`[${new Date()}]: ${data.msg}`, data.data);
        });
    }

    if (levelNum <= LogLevelToNumber[LogLevel.error]) {
        eventEmitter.on(LogLevel.error, (data: LogEvent) => {
            console.error(`[${new Date()}]: ${data.msg}`, data.data);
        });
    }

    return <React.Fragment>{children}</React.Fragment>;
};
