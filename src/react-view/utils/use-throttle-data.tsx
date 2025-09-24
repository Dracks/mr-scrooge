import { useEffect, useState } from 'react';

export function useThrottledData<T>(data: T[], delay: number): T[] {
    const [throttledData, setThrottledData] = useState<T[]>([]);
    const [canUpdate, setCanUpdate] = useState(true);
    const [timer, setTimer] = useState<unknown>()

    useEffect(()=>{
        if (!timer && throttledData != data){
            const newTimer = setTimeout(() => { setCanUpdate(true) }, delay);
            setTimer(newTimer)
        }
    }, [timer, canUpdate, throttledData, data])
    
    useEffect(() => {
        if (canUpdate) {
            setThrottledData(data);
            setCanUpdate(false);
        }
    }, [data, canUpdate]);

    return throttledData;
}
