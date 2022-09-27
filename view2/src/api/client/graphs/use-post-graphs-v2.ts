import useAxios, { UseAxiosResult } from 'axios-hooks';

import { graphV2Url } from './graphs.constants';
import { GetGraphsV2Response } from './types';

export const usePostGraphsV2 = (): UseAxiosResult<GetGraphsV2Response> =>
    useAxios(
        {
            url: graphV2Url,
            method: 'POST',
        },
        { manual: true },
    );
