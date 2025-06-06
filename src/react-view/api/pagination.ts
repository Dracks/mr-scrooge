import React from 'react';
import { useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useLogger } from '../utils/logger/logger.context';

export interface RequestedPage<T> {
    results: T[];
    next?: string;
}

export interface PaginationLoadOptions<T> {
    hash?: (elem: T) => string;
    autostart: boolean;
}

type PaginationLoadStatus = 'completed' | 'loading' | 'error';

export const usePagination = <T>(
    cb: (next?: string) => Promise<RequestedPage<T>> | RequestedPage<T>,
    options: PaginationLoadOptions<T> = { autostart: true },
) => {
    const [loadedData, setLoaded] = useState<T[]>([]);
    const request = useAsyncCallback(cb);
    const [error, setError] = useState<unknown>();
    const logger = useLogger();

    const process = (data: T[]) => {
        setLoaded(oldData => {
            const hashFn = options.hash;
            if (hashFn) {
                const newData = [...oldData];
                const idxMap = new Map(newData.map((data, idx) => [hashFn(data), idx]));
                data.forEach(elem => {
                    const id = hashFn(elem);
                    const idx = idxMap.get(id);
                    if (typeof idx === 'number') {
                        newData[idx] = elem;
                    } else {
                        idxMap.set(id, newData.length);
                        newData.push(elem);
                    }
                });
                return newData;
            } else {
                return [...oldData, ...data];
            }
        });
    };

    const deleteElement = (data: T) => {
        const hashFn = options.hash;
        if (!hashFn) {
            throw new Error('Cannot call delete on usePagination without a hashFn');
        }
        const dataId = hashFn(data);
        setLoaded(oldData => {
            return oldData.filter(test => hashFn(test) !== dataId);
        });
    };

    const execute = (next?: string) => {
        request.execute(next).then(
            data => {
                process(data.results);
            },
            (error: unknown) => {
                setError(error);
            },
        );
    };

    const start = () => {
        if (request.status !== 'loading') {
            execute();
        } else {
            logger.warn('Start cannot be launch when there is already another execution');
        }
    };

    React.useEffect(() => {
        if (options.autostart && request.status === 'not-requested') {
            start();
        }
    }, [options.autostart, request.status]);

    React.useEffect(() => {
        if (request.status === 'success') {
            if (request.result?.next) {
                execute(request.result.next);
            }
        }
    }, [request.status]);
    let status: PaginationLoadStatus = 'loading';
    if (request.status === 'success' && !request.result?.next) {
        status = 'completed';
    }

    if (request.status === 'loading' || request.result?.next !== undefined) {
        status = 'loading';
    }
    if (error) {
        status = 'error';
    }

    return {
        status: status,
        start,
        reset: (clean: boolean = false) => {
            if (clean) {
                setLoaded([]);
            }
            setError(undefined);
            request.reset();
        },
        deleteElement,
        loadedData,
        update: process,
        error,
    };
};
