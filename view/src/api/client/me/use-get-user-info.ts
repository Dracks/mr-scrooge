import useAxios, { UseAxiosResult } from 'axios-hooks';

import { UserInfo } from './me.types';

export const useGetUserInfo = (): UseAxiosResult<UserInfo> =>
    useAxios(
        {
            url: '/me/',
        },
        {
            manual: true,
        },
    );
