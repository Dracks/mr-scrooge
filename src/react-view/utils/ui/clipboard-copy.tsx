import { Text } from 'grommet';
import React from 'react';

import { useLogger } from '../logger/logger.context';
import { useErrorMsg } from './errors';

export type CopyState =
    | { state: 'idle' }
    | { state: 'success' }
    | { state: 'error'; message: string }
    | { state: 'disabled'; message: string };

const isClipboardSupported = 'clipboard' in navigator && typeof navigator.clipboard.writeText === 'function';

interface CopyStatusLineProps {
    status: CopyState;
    successLabel?: string;
}

export const CopyStatusLine: React.FC<CopyStatusLineProps> = ({ status, successLabel = 'Copied!' }) => {
    switch (status.state) {
        case 'error':
            return (
                <Text size="small" color="status-error">
                    {status.message}
                </Text>
            );
        case 'success':
            return (
                <Text size="small" color="status-ok">
                    {successLabel}
                </Text>
            );
        case 'disabled':
            return (
                <Text size="small" color="status-warning">
                    {status.message}
                </Text>
            );
        default:
            return <Text size="small">&nbsp;</Text>;
    }
};

export function useClipboardCopy() {
    const logger = useLogger('useClipboardCopy');
    const [status, setStatus] = React.useState<CopyState>(
        isClipboardSupported
            ? { state: 'idle' }
            : { state: 'disabled', message: 'Copy disabled — insecure connection' },
    );
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const scheduleReset = React.useCallback(() => {
        if (timeoutRef.current !== undefined) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setStatus({ state: 'idle' });
            timeoutRef.current = undefined;
        }, 5000);
    }, []);

    const handleCopy = React.useCallback(
        (value: string) => {
            try {
                void navigator.clipboard
                    .writeText(value)
                    .then(
                        () => {
                            setStatus({ state: 'success' });
                        },
                        (err: unknown) => {
                            setStatus({ state: 'error', message: useErrorMsg(err) });
                        },
                    )
                    .then(() => {
                        scheduleReset();
                    });
            } catch (err) {
                setStatus({ state: 'error', message: useErrorMsg(err) });
                scheduleReset();
                logger.error('Error writing to clipboard', { error: err });
            }
        },
        [scheduleReset],
    );

    return { handleCopy, status };
}
