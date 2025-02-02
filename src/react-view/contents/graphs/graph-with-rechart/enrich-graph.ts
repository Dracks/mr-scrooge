import { ApiUUID, GraphParam, Group, Label } from '../../../api/models';
import { EnrichedGraph, EnrichedGroup } from '../types';

export const enrichGroup = <T extends Group>(
    { labels: labelIds, ...group }: T,
    labelsMap: Map<ApiUUID, Label>,
): EnrichedGroup<T> => {
    const labels = labelIds?.map(label => labelsMap.get(label)).filter(Boolean) as Label[];

    return {
        ...group,
        labels,
    };
};

export const enrichGraph = <T extends GraphParam>(graph: T, labelsList: Label[]): EnrichedGraph<T> => {
    const { horizontalGroup, group } = graph;
    const ownedLabels = labelsList.filter(({ groupOwnerId }) => groupOwnerId === graph.groupOwnerId);
    const ownMapedLabels = new Map(ownedLabels.map(label => [label.id, label]));
    return {
        ...graph,
        group: enrichGroup(group, ownMapedLabels),
        horizontalGroup: horizontalGroup ? enrichGroup(horizontalGroup, ownMapedLabels) : undefined,
    };
};
