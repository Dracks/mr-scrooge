import useAxios, { UseAxiosResult } from "axios-hooks";
import { PostTagResponse } from "./types";

export const usePutTag = (tagId: number): UseAxiosResult<PostTagResponse> =>{
    return useAxios({
        url: `/tag/${tagId}/`,
        method: 'PUT',
    }, {
        manual: true,
    })
}