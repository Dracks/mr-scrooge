

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