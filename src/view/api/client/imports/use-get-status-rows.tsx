import useAxios, { UseAxiosResult } from 'axios-hooks';

import { GetStausReportRowResponse } from './types';

export const useGetStatusRows = (rowIds: number[]): UseAxiosResult<GetStausReportRowResponse> => {
    return useAxios({
        url: '/status-row/',
        params: {
            ids: rowIds,
        },
    });
};
