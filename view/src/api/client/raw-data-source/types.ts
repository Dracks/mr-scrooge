import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export type RawDataSource = CamelCasedProperties<components['schemas']['RawData']>;

export interface RawDataSourceListParams {
    cursor?: string;
    pageSize?: number;
}
