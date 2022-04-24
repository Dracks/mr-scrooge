import useAxios, { UseAxiosResult } from "axios-hooks";
import { GetGraphsResponse } from "./types";

export const useGetGraphs = (): UseAxiosResult<GetGraphsResponse> => {
    return useAxios('/graph/')
}