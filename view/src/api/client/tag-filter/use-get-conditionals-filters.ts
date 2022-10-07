import useAxios, { UseAxiosResult } from 'axios-hooks';

import { TagFilterUrl } from './constants';
import { FilterConditional } from './types';

export const useGetFilterConditionals = (): UseAxiosResult<Record<FilterConditional, string>> =>
    useAxios('/tag-filter/types/');
