import useAxios, { UseAxiosResult } from 'axios-hooks';

import { PostTagResponse } from './types';

export const usePostTags = (): UseAxiosResult<PostTagResponse> =>
    useAxios(
        {
            url: '/tag/',
            method: 'POST',
        },
        { manual: true },
    );
