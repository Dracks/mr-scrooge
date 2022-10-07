import useAxios, { UseAxiosResult } from 'axios-hooks';

export const useDeleteLogout = (): UseAxiosResult<{}, {}> =>
    useAxios(
        {
            url: 'session/logout/',
            method: 'DELETE',
        },
        { manual: true },
    );
