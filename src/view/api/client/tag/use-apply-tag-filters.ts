import useAxios, { UseAxiosResult } from 'axios-hooks';

export const useApplyTagFilters = (tagId: number): UseAxiosResult =>
    useAxios(
        {
            url: `/tag/${tagId}/apply_filters`,
            method: 'POST',
        },
        {
            manual: true,
        },
    );
