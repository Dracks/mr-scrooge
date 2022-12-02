import { CursorPaginationResult, useCursorPaginationAxios } from '../common/use-cursor-pagination';
import { RawDataSource } from './types';

export const useGetPaginatedRawDataSource = (): CursorPaginationResult<RawDataSource> =>
    useCursorPaginationAxios({
        url: 'raw-data/',
        params: {
            pageSize: 100,
        },
    });
