import useAxios, { UseAxiosResult } from 'axios-hooks';

export const useDeleteLogout = (): UseAxiosResult<unknown, unknown> =>
    useAxios(
        {
            url: 'session/logout/',
            method: 'DELETE',
        },
        { manual: true },
    );
