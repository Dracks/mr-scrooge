import { GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind } from '../../../graphql/generated';

export const GraphV2Pie: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.All,
    group: {
        group: GQLGraphGroup.Labels,
        labels: [4, 5, 8],
    },
    groupOwnerId: 1,
    kind: GQLGraphKind.Pie,
    labelFilter: 2,
    name: 'Percentatge',
};

export const GraphV2Line: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.Six,
    group: {
        group: GQLGraphGroup.Month,
    },
    groupOwnerId: 1,
    horizontalGroup: {
        accumulate: true,
        group: GQLGraphGroup.Day,
    },
    kind: GQLGraphKind.Line,
    labelFilter: 2,
    name: 'Compare by day',
};

export const GraphV2Bar: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.Year,
    group: {
        group: GQLGraphGroup.Sign,
    },
    groupOwnerId: 1,
    horizontalGroup: {
        accumulate: false,
        group: GQLGraphGroup.Month,
    },
    kind: GQLGraphKind.Bar,
    labelFilter: 1,
    name: 'Income vs outcome',
};
