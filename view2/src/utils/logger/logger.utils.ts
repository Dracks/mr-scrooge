import { LogLevel } from './logger.types';

export const LogLevelToNumber: Record<LogLevel, number> = {
    [LogLevel.info]: 5,
    [LogLevel.warn]: 10,
    [LogLevel.error]: 15,
};
