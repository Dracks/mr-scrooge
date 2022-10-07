import useAxios, { UseAxiosResult } from 'axios-hooks';

import { graphV2Url } from './graphs.constants';
import { GetGraphsV2Response } from './types';

export const useGetGraphsV2 = (): UseAxiosResult<GetGraphsV2Response> => useAxios(graphV2Url);
