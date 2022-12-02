import useAxios, { UseAxiosResult } from 'axios-hooks';

import { UserInfo, UserInfoWithPassword } from './me.types';

export const usePatchUserInfo = (): UseAxiosResult<UserInfo, UserInfoWithPassword> =>
    useAxios(
        {
            url: '/me/',
            method: 'PATCH',
        },
        {
            manual: true,
        },
    );
