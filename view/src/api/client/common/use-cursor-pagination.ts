import { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
import useAxios, { Options } from 'axios-hooks';

export interface CursorPaginationResult<T> {
    error?: AxiosError<unknown, unknown> | null;
    loading: boolean;
    next?: () => AxiosPromise<CursorPagination<T>>;
    previous?: () => AxiosPromise<CursorPagination<T>>;
    reset: () => AxiosPromise<CursorPagination<T>>;
    results?: T[];
}

interface CursorPagination<T> {
    next?: string;
    previous?: string;
    results: T[];
}

export const useCursorPaginationAxios = <TResponse = any, TBody = any, TError = any>(
    config: AxiosRequestConfig<TBody>,
    options?: Options,
): CursorPaginationResult<TResponse> => {
    const [response, request] = useAxios<CursorPagination<TResponse>, TBody, TError>(config, options);

    const { data, loading, error } = response;
    const getNewConfig: (cursor?: string) => AxiosRequestConfig<TBody> = cursor => ({
        ...config,
        params: {
            ...config.params,
            cursor,
        },
    });
    const next = data?.next ? () => request(getNewConfig(data.next)) : undefined;
    const previous = data?.next ? () => request(getNewConfig(data.previous)) : undefined;

    return {
        loading,
        error,
        results: data?.results,
        reset: () => request(config),
        next,
        previous,
    };
};
