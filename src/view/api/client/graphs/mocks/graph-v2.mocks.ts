import { listLabelIds } from '../../../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../../../utils/data-factory/user-group.factory';
import { GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind } from '../../../graphql/generated';


export const GraphV2Pie: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.All,
    group: {
        group: GQLGraphGroup.Labels,
        labels: [4, 5, 8].map(idx => listLabelIds[idx]),
    },
    groupOwnerId: mainGroupOwnerId,
    kind: GQLGraphKind.Pie,
    labelFilterId: listLabelIds[2],
    name: 'Percentatge',
};

export const GraphV2Line: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.Six,
    group: {
        group: GQLGraphGroup.Month,
    },
    groupOwnerId: mainGroupOwnerId,
    horizontalGroup: {
        accumulate: true,
        group: GQLGraphGroup.Day,
    },
    kind: GQLGraphKind.Line,
    labelFilterId: listLabelIds[2],
    name: 'Compare by day',
};

export const GraphV2Bar: Omit<GQLGraph, 'id'> = {
    dateRange: GQLGraphDateRange.Year,
    group: {
        group: GQLGraphGroup.Sign,
    },
    groupOwnerId: mainGroupOwnerId,
    horizontalGroup: {
        accumulate: false,
        group: GQLGraphGroup.Month,
    },
    kind: GQLGraphKind.Bar,
    labelFilterId: listLabelIds[1],
    name: 'Income vs outcome',
};
