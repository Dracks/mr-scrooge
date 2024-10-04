import { EventEmitter } from 'events';
import { eventNames } from 'process';

import { ILogger, LogEvent, LogFn, LogLevel } from './logger.types';

export const getLogEvent = (level: LogLevel) => `log-${level}`;

export class Logger implements ILogger {
    info: LogFn;

    warn: LogFn;

    error: LogFn;

    constructor(emitter: EventEmitter, ctx?: string) {
        const buildLog: (level: LogLevel) => LogFn = level => {
            const eventName = getLogEvent(level);
            return (msg, data) => {
                try {
                    const event: LogEvent = {
                        ts: new Date(),
                        level,
                        msg,
                        data,
                        ctx,
                    };
                    emitter.emit(eventName, event);
                } catch (error) {
                    console.error('Error on the logger', error);
                }
            };
        };
        this.info = buildLog(LogLevel.info);
        this.warn = buildLog(LogLevel.warn);
        this.error = buildLog(LogLevel.error);
    }
}
