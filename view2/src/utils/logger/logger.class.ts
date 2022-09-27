import { EventEmitter } from 'events';

import { ILogger, LogEvent, LogFn, LogLevel } from './logger.types';

export class Logger implements ILogger {
    info: LogFn;

    warn: LogFn;

    error: LogFn;

    constructor(emitter: EventEmitter) {
        const buildLog: (logLevel: LogLevel) => LogFn = level => (msg, data) => {
            const event: LogEvent = {
                ts: new Date(),
                level,
                msg,
                data,
            };
            emitter.emit(level, event);
        };
        this.info = buildLog(LogLevel.info);
        this.warn = buildLog(LogLevel.warn);
        this.error = buildLog(LogLevel.error);
    }
}
