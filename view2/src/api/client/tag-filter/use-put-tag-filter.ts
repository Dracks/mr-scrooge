import useAxios, { UseAxiosResult } from 'axios-hooks';

import { TagFilterUrl } from './constants';
import { PostTagFilterResponse, TagFilter } from './types';

export const usePutTagFilter = (tagId: number): UseAxiosResult<PostTagFilterResponse, TagFilter> =>
    useAxios(
        {
            url: `${TagFilterUrl}${tagId}/`,
            method: 'PUT',
        },
        {
            manual: true,
        },
    );
