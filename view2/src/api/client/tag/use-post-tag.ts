import useAxios, { UseAxiosResult } from "axios-hooks";
import { PostTagResponse } from "./types";

export const usePostTags = (): UseAxiosResult<PostTagResponse> =>{
    return useAxios({
        url: '/tag/',
        method: 'POST'
    }, {manual: true})
}