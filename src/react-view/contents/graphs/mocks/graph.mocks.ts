import { ApiUUID, GraphParam } from '../../../api/models';
import { listLabelIds } from '../../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../../utils/data-factory/user-group.factory';

export const GraphPie: GraphParam = {
    dateRange: 'all',
    group: {
        group: 'labels',
        labels: [4, 5, 8].map(idx => listLabelIds[idx] as ApiUUID),
    },
    groupOwnerId: mainGroupOwnerId,
    kind: 'pie',
    labelFilterId: listLabelIds[2],
    name: 'Percentatge',
};

export const GraphLine: GraphParam = {
    dateRange: 'halfYear',
    group: {
        group: 'month',
    },
    groupOwnerId: mainGroupOwnerId,
    horizontalGroup: {
        accumulate: true,
        group: 'day',
    },
    kind: 'line',
    labelFilterId: listLabelIds[2],
    name: 'Compare by day',
};

export const GraphBar: GraphParam = {
    dateRange: 'oneYear',
    group: {
        group: 'sign',
    },
    groupOwnerId: mainGroupOwnerId,
    horizontalGroup: {
        accumulate: false,
        group: 'month',
    },
    kind: 'bar',
    labelFilterId: listLabelIds[1],
    name: 'Income vs outcome',
};
