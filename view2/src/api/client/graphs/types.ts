import { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest"
import { components } from "../../generated-models"
import { Tag } from "../tag/types"

/*
    Old graphs for retro compatibility
    */
export enum GraphKind {
    bar='bar',
    pie='pie',
    line='line'
}

export enum DateRange {
    all = 'all',
    sixYears='sixYears',
    twoYears='twoYears',
    oneYear='year',
    halfYear='six',
    oneMonth='month',
}

export enum GraphGroupEnum {
    day='day',
    month='month',
    year='year',
    tags='tags',
    sign='sign',
}

export interface Graph {
    id: number,
    name: string,
    tag: number,
    kind: GraphKind,
    acumulative: boolean,
    dateRange: DateRange,
    group: GraphGroupEnum
    groupValue?: number[],
    groupHideOthers?: boolean,
}

export interface BarGraph extends Graph{
    kind: GraphKind.bar | GraphKind.line,
    horizontal: GraphGroupEnum,
    horizontalValue?: number[],
    horizontalHideOthers?: boolean
}

/*
New graphs coming from Api Rest
 */

export type GetGraphsResponse = Graph[]

export type GraphV2 = CamelCasedPropertiesDeep<components['schemas']['GraphV2']>

export type GetGraphsV2Response = GraphV2[]

export type GetGraphV2Response = GraphV2

export interface EnrichedGroup extends Omit<CamelCasedPropertiesDeep<components['schemas']['Group']>, 'groupTags'> {
    groupTags: Tag[]
}

export interface EnrichedHorizontalGroup extends EnrichedGroup {
    accumulate?: boolean
}


export type GraphGroup = CamelCasedPropertiesDeep<components['schemas']['Group']>

export interface EnrichedGraph extends Omit<GraphV2, 'group' | 'horizontalGroup'>  {
    group: EnrichedGroup,
    horizontalGroup?: EnrichedHorizontalGroup,
}