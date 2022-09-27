import useAxios, { UseAxiosResult } from 'axios-hooks';

import { PostTagResponse } from './types';

export const useDeleteTag = (tagId: number): UseAxiosResult<PostTagResponse> =>
    useAxios(
        {
            url: `/tag/${tagId}/`,
            method: 'DELETE',
        },
        {
            manual: true,
        },
    );
