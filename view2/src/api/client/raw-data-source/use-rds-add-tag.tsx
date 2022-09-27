import { AxiosPromise } from 'axios';
import useAxios from 'axios-hooks';

import { RawDataSource } from './types';

export enum RdsLinkTagAction {
    Add = 'add',
    Remove = 'remove',
}

export const useRdsAddTag = () => {
    const [_, request] = useAxios<RawDataSource>({}, { manual: true });

    return (action: RdsLinkTagAction, rdsId: number, tag: number): AxiosPromise<RawDataSource> => {
        return request({
            url: `raw-data/${rdsId}/link/`,
            method: action === RdsLinkTagAction.Remove ? 'DELETE' : 'POST',
            data: {
                tag,
            },
        });
    };
};
