import useAxios, { UseAxiosResult } from 'axios-hooks';

import { GetSessionResponse, LoginParams } from './types';

export const usePostLogin = (): UseAxiosResult<GetSessionResponse, LoginParams> =>
    useAxios(
        {
            url: '/session/',
            method: 'POST',
        },
        { manual: true },
    );
