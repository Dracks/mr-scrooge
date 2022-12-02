import useAxios, { UseAxiosResult } from 'axios-hooks';

import { TagFilterUrl } from './constants';
import { GetTagFilterResponse } from './types';

export const useGetTagFilters = (tagId: number): UseAxiosResult<GetTagFilterResponse> =>
    useAxios({
        url: TagFilterUrl,
        params: {
            tag: tagId,
        },
    });
