import { CamelCasedPropertiesDeep } from 'type-fest';

import { components } from '../../generated-models';
import { Tag } from '../tag/types';

/*
 *Old graphs for retro compatibility
 */
export enum GraphKind {
    bar = 'bar',
    line = 'line',
    pie = 'pie',
}

export enum DateRange {
    all = 'all',
    halfYear = 'six',
    oneMonth = 'month',
    oneYear = 'year',
    sixYears = 'sixYears',
    twoYears = 'twoYears',
}

export enum GraphGroupEnum {
    day = 'day',
    month = 'month',
    sign = 'sign',
    tags = 'tags',
    year = 'year',
}

interface BarLineGraph {
    acumulative?: boolean;
    dateRange: DateRange;
    group: GraphGroupEnum;
    groupHideOthers?: boolean;
    groupValue?: number[];
    horizontal: GraphGroupEnum;
    horizontalHideOthers?: boolean;
    horizontalValue?: number[];
    id: number;
    kind: GraphKind.bar | GraphKind.line;
    name: string;
    tag: number;
}

interface PieGraph {
    dateRange: DateRange;
    group: 'identity';
    horizontal: GraphGroupEnum;
    horizontalHideOthers?: boolean;
    horizontalValue?: number[];
    id: number;
    kind: GraphKind.pie;
    name: string;
    tag: number;
}

export type Graph = BarLineGraph | PieGraph;

/*
 *New graphs coming from Api Rest
 */

export type GetGraphsResponse = Graph[];

export type GraphV2 = CamelCasedPropertiesDeep<components['schemas']['GraphV2']>;

export type GetGraphsV2Response = GraphV2[];

export type GetGraphV2Response = GraphV2;

export interface EnrichedGroup extends Omit<CamelCasedPropertiesDeep<components['schemas']['Group']>, 'groupTags'> {
    groupTags: Tag[];
}

export interface EnrichedHorizontalGroup extends EnrichedGroup {
    accumulate?: boolean;
}

export type GraphGroup = CamelCasedPropertiesDeep<components['schemas']['Group']>;

export interface EnrichedGraph extends Omit<GraphV2, 'group' | 'horizontalGroup'> {
    group: EnrichedGroup;
    horizontalGroup?: EnrichedHorizontalGroup;
}
