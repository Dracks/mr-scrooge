import { Box, Button, Heading, Meter, Text } from 'grommet';
import React, { useEffect, useRef, useState } from 'react';

import { useApiClient } from '../../../api/client';
import { WrapperApiError } from '../../../utils/ui/errors/api-error-response';
import { useErrorMsg } from '../../../utils/ui/errors/use-error-msg';

interface ImportBulkDropProgressProps {
    ids: Set<string>;
    onDone: () => void;
    onClose: () => void;
}

export const ImportBulkDropProgress: React.FC<ImportBulkDropProgressProps> = ({ ids, onDone, onClose }) => {
    const client = useApiClient();
    const mountedRef = useRef(true);
    const [current, setCurrent] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const total = ids.size;

    useEffect(() => {
        if (total === 0) {
            onDone();
            return;
        }

        const newErrors: string[] = [];

        const run = async () => {
            for (const id of ids) {
                try {
                    const result = await client.DELETE('/imports/{id}', { params: { path: { id } } });
                    if (result.response.status !== 200) {
                        const apiError = (result as { error?: { code: string; message: string } }).error;
                        if (apiError) {
                            newErrors.push(useErrorMsg(new WrapperApiError(apiError)));
                        } else {
                            newErrors.push(
                                useErrorMsg(`HTTP ${String(result.response.status)}: ${result.response.statusText}`),
                            );
                        }
                    }
                } catch (e) {
                    newErrors.push(useErrorMsg(e));
                }

                if (mountedRef.current) {
                    setCurrent(prev => prev + 1);
                }
            }

            if (mountedRef.current) {
                setErrors(newErrors);
                if (newErrors.length === 0) {
                    onDone();
                }
            }
        };

        void run();

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return (
        <>
            <Heading level={3}>Deleting imports...</Heading>
            <Meter type="bar" values={[{ value: current }]} max={total} />
            <Text>
                {current} of {total} deleted
            </Text>
            {errors.length > 0 && (
                <Box pad="medium" background="status-critical" round>
                    <Heading level="4" color="white">
                        Errors deleting imports
                    </Heading>
                    {errors.map((msg, i) => (
                        <Text key={i} color="white">
                            {msg}
                        </Text>
                    ))}
                    <Box direction="row" justify="end" margin={{ top: 'small' }}>
                        <Button label="Close" onClick={onClose} />
                    </Box>
                </Box>
            )}
        </>
    );
};
