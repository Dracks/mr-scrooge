import { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
import useAxios, { Options } from 'axios-hooks';
import * as Urql from 'urql';
import { CombinedError } from 'urql';

interface CursorPagination<T> {
    next?: string;
    previous?: string;
    results: T[];
}

export interface CursorPaginationResult<T> {
    error?: AxiosError<unknown, unknown> | CombinedError | null;
    loading: boolean;
    next?: () => void;
    reset: () => void;
    results?: T[];
}


export const useCursorPaginationQuery = <Data extends object, Variables extends Urql.AnyVariables = Urql.AnyVariables, R = unknown>(
    options: Urql.UseQueryArgs<Variables, Data>,
    field: keyof Data
): CursorPaginationResult<R> => {
    const [response, request] = Urql.useQuery(options);

    const { data: parentData, fetching: loading, error } = response;
    const data = parentData?.[field] as {results: R[], next?: string}
    const getNewConfig: (cursor?: string) => Urql.UseQueryArgs<Variables, Data> = cursor => ({
        ...options,
        variables: {
            ...options.variables,
            cursor,
        },
    });

    const next = data?.next ? () => request(getNewConfig(data.next)) : undefined;

    return {
        error,
        loading,
        next,
        reset: () => request(options),
        results: data?.results,
    };
};