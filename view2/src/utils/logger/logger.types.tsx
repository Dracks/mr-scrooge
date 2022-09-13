
export type extraData = unknown;

export type LogFn = (msg: string, obj?:extraData) => void

export enum LogLevel {
    info= 'info',
    warn= 'warn',
    error='error',
}

export interface LogEvent {
    ts: Date,
    level: LogLevel,
    msg: string,
    data?:extraData
}

export interface ILogger {
    info: LogFn
    warn: LogFn
    error: LogFn
}

export interface LoggerOutput {
    onLog(ev: LogEvent): void;
}


export interface LoggerArguments {
    logLevel: LogLevel
}