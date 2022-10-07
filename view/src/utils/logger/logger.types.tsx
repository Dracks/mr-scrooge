export type extraData = unknown;

export type LogFn = (msg: string, obj?: extraData) => void;

export enum LogLevel {
    error = 'error',
    info = 'info',
    warn = 'warn',
}

export interface LogEvent {
    data?: extraData;
    level: LogLevel;
    msg: string;
    ts: Date;
}

export interface ILogger {
    error: LogFn;
    info: LogFn;
    warn: LogFn;
}

export interface LoggerOutput {
    onLog(ev: LogEvent): void;
}

export interface LoggerArguments {
    logLevel: LogLevel;
}
