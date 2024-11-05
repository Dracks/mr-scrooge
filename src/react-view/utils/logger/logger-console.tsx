import React from 'react';

import { getLogEvent } from './logger.class';
import { useLoggerEmitter } from './logger.context';
import { LogEvent, LoggerArguments, LogLevel } from './logger.types';
import { LogLevelToNumber } from './logger.utils';

const getMsg = (data: LogEvent) => {
    if (data.ctx) {
        return `[${new Date().toISOString()}] ${data.ctx}: ${data.msg}`;
    }
    return `[${new Date().toISOString()}]: ${data.msg}`;
};

const LoggerList = [
    { level: LogLevel.info, fn: console.log },
    { level: LogLevel.warn, fn: console.warn },
    { level: LogLevel.error, fn: console.error },
].map(({ level, fn }) => ({
    level,
    fn: (data: LogEvent) => {
        fn(getMsg(data), data.data);
    },
    levelNum: LogLevelToNumber[level],
    eventName: getLogEvent(level),
}));

export const LoggerConsole: React.FC<LoggerArguments & { children?: React.ReactNode }> = ({ children, logLevel }) => {
    const eventEmitter = useLoggerEmitter();
    const minLevelNum = LogLevelToNumber[logLevel];
    React.useEffect(() => {
        const logs = LoggerList.filter(({ levelNum }) => minLevelNum <= levelNum);
        logs.forEach(log => {
            eventEmitter.on(log.eventName, log.fn);
        });

        return () => {
            logs.forEach(log => {
                eventEmitter.removeListener(log.eventName, log.fn);
            });
        };
    });

    return <React.Fragment>{children}</React.Fragment>;
};
