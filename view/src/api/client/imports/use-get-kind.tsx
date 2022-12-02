import useAxios, { UseAxiosResult } from 'axios-hooks';

import { GetKindResponse } from './types';

export const useGetKinds = (): UseAxiosResult<GetKindResponse> => {
    return useAxios('/kind/');
};
