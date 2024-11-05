import React from 'react';

import { getLogEvent } from '../logger.class';
import { useLoggerEmitter } from '../logger.context';
import { LogEvent, LogLevel } from '../logger.types';
import { RenderUnknown } from './renders';

export const LoggerUi: React.FC = () => {
    const loggerEmitter = useLoggerEmitter();
    const [showLogs, setShowLogs] = React.useState<boolean>(false);
    // const [logs, setLogs] = React.useState<LogEvent[]>([]);
    const logsRef = React.useRef<LogEvent[]>([]);
    const [logsCount, setLogsCount] = React.useState<number>(0);
    const logs = logsRef.current;

    const addLogs: (ev: LogEvent) => void = ev => {
        logsRef.current = [ev, ...logsRef.current];
        setTimeout(() => {
            setLogsCount(logsRef.current.length);
        }, 0);
    };

    React.useEffect(() => {
        const eventInfo = getLogEvent(LogLevel.info);
        const eventWarn = getLogEvent(LogLevel.warn);
        const eventError = getLogEvent(LogLevel.error);
        loggerEmitter.on(eventInfo, addLogs);
        loggerEmitter.on(eventWarn, addLogs);
        loggerEmitter.on(eventError, addLogs);
        return () => {
            loggerEmitter.removeListener(eventInfo, addLogs);
            loggerEmitter.removeListener(eventWarn, addLogs);
            loggerEmitter.removeListener(eventError, addLogs);
        };
    }, []);

    return (
        <div
            style={{
                backgroundColor: '#eeeeeeaa',
                border: '1px solid #ccc',
                left: '0px',
                position: 'absolute',
                bottom: '0px',
                zIndex: 10,
            }}
        >
            {showLogs ? (
                <ul>
                    {logs.map(event => (
                        <li key={event.ts.getTime()}>
                            {event.ts.toISOString()} [{event.level}
                            {event.ctx ? ` - ${event.ctx}` : ''}]: {event.msg}{' '}
                            {event.data ? <RenderUnknown data={event.data} /> : undefined}
                        </li>
                    ))}
                </ul>
            ) : undefined}
            {logsCount}
            &#9888; {logs.filter(event => event.level === LogLevel.warn).length}
            &#10060; {logs.filter(ev => ev.level === LogLevel.error).length}
            <button
                onClick={() => {
                    setShowLogs(!showLogs);
                }}
            >
                {showLogs ? 'hide logs' : 'show logs'}
            </button>
        </div>
    );
};
