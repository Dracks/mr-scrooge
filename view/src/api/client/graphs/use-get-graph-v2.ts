import useAxios, { UseAxiosResult } from 'axios-hooks';

import { graphV2Url } from './graphs.constants';
import { GetGraphV2Response } from './types';

export const useGetGraphV2 = (id: number): UseAxiosResult<GetGraphV2Response> => useAxios(`${graphV2Url}${id}/`);
