import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export type TagFilter = CamelCasedProperties<components['schemas']['Filter']>;
export type GetTagFilterResponse = TagFilter[];
export type PostTagFilterResponse = TagFilter;

export type FilterConditional = components['schemas']['TypeConditionalEnum'];
