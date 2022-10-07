import useAxios, { UseAxiosResult } from 'axios-hooks';

import { GetImportsResponse, GetKindResponse } from './types';

export const useGetImports = (): UseAxiosResult<GetImportsResponse> => {
    return useAxios('/status/');
};
