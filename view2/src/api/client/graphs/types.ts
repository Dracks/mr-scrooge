import { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest"
import { components } from "../../generated-models"


export enum GraphKind {
    bar='bar',
    pie='pie',
    line='line'
}

export enum DateRange {
    all = 'all',
    twoYears='twoYears',
    oneYear='year',
    halfYear='six',
    oneMonth='month',
}

export enum GraphGroupEnum {
    day='day',
    month='month',
    tags='tags',
    sign='sign',
}

export interface Graph {
    id: number,
    name: string,
    tag: number,
    kind: GraphKind,
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

export type GetGraphsResponse = Graph[]

export type GraphV2 = CamelCasedPropertiesDeep<components['schemas']['GraphV2']>

export type GetGraphsV2Response = GraphV2[]
