import useAxios, { UseAxiosResult } from "axios-hooks";
import { GetTagsResponse } from "./types";

export const useGetTags = (): UseAxiosResult<GetTagsResponse> =>{
    return useAxios('/tag/')
}