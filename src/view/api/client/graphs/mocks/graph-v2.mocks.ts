import { GQLGraph, GQLGraphGroup, GQLGraphKind } from '../../../graphql/generated';

export const GraphV2Pie: Omit<GQLGraph, 'id'> = {
    groupOwnerId: 1,
    dateRange: 'all',
    group: {
        group: GQLGraphGroup.Labels,
        labels: [ 4 , 5 , 8 ],
    },
    kind: GQLGraphKind.Pie,
    name: 'Percentatge',
    tagFilter: 2,
};

export const GraphV2Line: Omit<GQLGraph, 'id'> = {
    groupOwnerId: 1,
    dateRange: 'six',
    group: {
        group: GQLGraphGroup.Month,
    },
    horizontalGroup: {
        accumulate: true,
        group: GQLGraphGroup.Day,
    },
    kind: GQLGraphKind.Line,
    name: 'Compare by day',
    tagFilter: 2,
};

export const GraphV2Bar: Omit<GQLGraph, 'id'> = {
    groupOwnerId: 1,
    dateRange: 'year',
    group: {
        group: GQLGraphGroup.Sign,
    },
    horizontalGroup: {
        accumulate: false,
        group: GQLGraphGroup.Month,
    },
    kind: GQLGraphKind.Bar,
    name: 'Income vs outcome',
    tagFilter: 1,
};
