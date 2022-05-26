import useAxios, { UseAxiosResult } from "axios-hooks";
import { GetGraphsV2Response } from "./types";

export const useGetGraphsV2 = (): UseAxiosResult<GetGraphsV2Response> => {
    return useAxios('/graph-v2/')
}