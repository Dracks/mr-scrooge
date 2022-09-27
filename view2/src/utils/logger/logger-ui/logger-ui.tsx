import React from 'react';

import { useLoggerEmitter } from '../logger.context';
import { LogEvent, LogLevel } from '../logger.types';
import { RenderUnknown } from './renders';

export const LoggerUi: React.FC<{}> = () => {
    const loggerEmitter = useLoggerEmitter();
    const [showLogs, setShowLogs] = React.useState<boolean>(false);
    const [logs, setLogs] = React.useState<LogEvent[]>([]);
    const logsRef = React.useRef<LogEvent[]>([]);

    const addLogs: (ev: LogEvent) => void = ev => {
        logsRef.current = [ev, ...logsRef.current];
        setTimeout(() => setLogs(logsRef.current), 0);
    };

    React.useEffect(() => {
        loggerEmitter.on(LogLevel.info, addLogs);
        loggerEmitter.on(LogLevel.warn, addLogs);
        loggerEmitter.on(LogLevel.error, addLogs);
        return () => {
            loggerEmitter.removeListener(LogLevel.info, addLogs);
            loggerEmitter.removeListener(LogLevel.warn, addLogs);
            loggerEmitter.removeListener(LogLevel.error, addLogs);
        };
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                zIndex: 10,
                backgroundColor: '#eeeeeeaa',
                border: '1px solid #ccc',
            }}
        >
            {logs.length}
            &#9888; {logs.filter(event => event.level === LogLevel.warn).length}
            &#10060; {logs.filter(ev => ev.level === LogLevel.error).length}
            <button onClick={() => setShowLogs(!showLogs)}>{showLogs ? 'hide logs' : 'show logs'}</button>
            {showLogs ? (
                <ul>
                    {logs.map(event => (
                        <li key={event.ts.getTime()}>
                            {event.ts.toISOString()} [{event.level}]: {event.msg}{' '}
                            {event.data ? <RenderUnknown data={event.data} /> : undefined}
                        </li>
                    ))}
                </ul>
            ) : undefined}
        </div>
    );
};
