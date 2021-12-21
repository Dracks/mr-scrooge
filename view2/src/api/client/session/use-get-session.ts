import useAxios, { UseAxiosResult } from "axios-hooks"
import { GetSessionResponse } from "./types"


export const useGetSession = (): UseAxiosResult<GetSessionResponse>=>{
    return useAxios('/session/')
}