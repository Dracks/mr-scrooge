import useAxios, { UseAxiosResult } from "axios-hooks";

export interface UserInfo {
    user: string,
    email: string,
}

export const useGetUserInfo = (): UseAxiosResult<UserInfo> => {
    return useAxios('/me/')
}