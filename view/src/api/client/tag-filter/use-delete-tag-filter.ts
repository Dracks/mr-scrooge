import useAxios, { UseAxiosResult } from 'axios-hooks';

import { TagFilterUrl } from './constants';
import { PostTagFilterResponse } from './types';

export const useDeleteTagFilter = (tagId: number): UseAxiosResult<PostTagFilterResponse> =>
    useAxios(
        {
            url: `${TagFilterUrl}${tagId}/`,
            method: 'DELETE',
        },
        {
            manual: true,
        },
    );
