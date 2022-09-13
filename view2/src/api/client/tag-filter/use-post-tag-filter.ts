import useAxios, { UseAxiosResult } from "axios-hooks";
import { TagFilterUrl } from "./constants";
import { PostTagFilterResponse } from "./types";

export const usePostTagFilter = (): UseAxiosResult<PostTagFilterResponse> =>{
    return useAxios({
        url: TagFilterUrl,
        method: 'POST'
    }, {manual: true})
}