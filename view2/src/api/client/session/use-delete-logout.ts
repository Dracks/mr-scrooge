import useAxios, { UseAxiosResult } from "axios-hooks";

export const useDeleteLogout = ():UseAxiosResult<{},{}> =>useAxios({
    url: '/session/',
    method: 'DELETE'
}, {manual: true})