import useAxios, { UseAxiosResult } from "axios-hooks";

export interface UserInfo {
    email: string;
    user: string;
}

export const useGetUserInfo = (): UseAxiosResult<UserInfo> => useAxios("/me/")
