import { useEffect, useState } from 'react';

export function useThrottledData<T>(data: T[], delay: number): T[] {
    const [throttledData, setThrottledData] = useState<T[]>([]);
    const [canUpdate, setCanUpdate] = useState(true);

    useEffect(() => {
        if (canUpdate) {
            setThrottledData(data);
            setCanUpdate(false);
        }
    }, [data, canUpdate]);

    useEffect(() => {
        if (!canUpdate) {
            const timer = setTimeout(() => {
                setCanUpdate(true);
            }, delay);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [canUpdate]);

    return throttledData;
}
