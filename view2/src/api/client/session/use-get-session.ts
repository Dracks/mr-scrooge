import useAxios, { UseAxiosResult } from "axios-hooks"

export const useGetSession = (): UseAxiosResult<{isAuthorized: boolean}>=>{
    return useAxios('/session/')
}