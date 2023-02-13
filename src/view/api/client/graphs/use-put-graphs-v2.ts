import useAxios, { UseAxiosResult } from 'axios-hooks';

import { graphV2Url } from './graphs.constants';
import { GetGraphsV2Response } from './types';

export const usePutGraphsV2 = (graphId: number): UseAxiosResult<GetGraphsV2Response> =>
    useAxios(
        {
            url: `${graphV2Url}${graphId}/`,
            method: 'PUT',
        },
        { manual: true },
    );
