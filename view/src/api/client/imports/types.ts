import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export interface Kind {
    name: string;
    regex: string;
}
export type GetKindResponse = Kind[];

export type StatusReport = CamelCasedProperties<components['schemas']['StatusReport']>;

export type GetImportsResponse = StatusReport[];
