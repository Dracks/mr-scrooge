import useAxios, { UseAxiosResult } from 'axios-hooks';

import { GetImportsResponse } from './types';

export const useGetImports = (): UseAxiosResult<GetImportsResponse> => {
    return useAxios('/status/');
};
