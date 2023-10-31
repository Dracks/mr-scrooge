import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export type Tag = CamelCasedProperties<components['schemas']['Tag']>;
export type GetTagsResponse = Tag[];
export type PostTagResponse = Tag;
