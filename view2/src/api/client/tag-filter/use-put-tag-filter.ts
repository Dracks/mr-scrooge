import useAxios, { UseAxiosResult } from "axios-hooks";
import { PostTagFilterResponse } from "./types";

export const usePutTagFilter = (tagId: number): UseAxiosResult<PostTagFilterResponse> =>{
    return useAxios({
        url: `/tag/${tagId}/`,
        method: 'PUT',
    }, {
        manual: true,
    })
}