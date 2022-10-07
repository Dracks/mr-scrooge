import { AxiosPromise } from 'axios';
import useAxios from 'axios-hooks';

import { RawDataSource } from './types';

export const useRdsSetDescription = () => {
    const [_, request] = useAxios<RawDataSource>({}, { manual: true });

    return (rdsId: number, description: string): AxiosPromise<RawDataSource> => {
        const isdelete = description === '';

        return request({
            url: `raw-data/${rdsId}/description/`,
            method: isdelete ? 'DELETE' : 'POST',
            data: {
                description,
            },
        });
    };
};
