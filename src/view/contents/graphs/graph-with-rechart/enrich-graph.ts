import { EnrichedGraph, EnrichedGroup } from '../../../api/client/graphs/types';
import { GQLGroup, GQLLabel, GQLNewGraph } from '../../../api/graphql/generated';

export const enrichGroup = <T extends Omit<GQLGroup, '__typename'>>(
    { labels: oldLabels, ...group }: T,
    labelsMap: Map<number, GQLLabel>,
): EnrichedGroup => {
    const labels = (oldLabels?.map(label => labelsMap.get(label)).filter(Boolean) as GQLLabel[]) ?? [];

    return {
        ...group,
        labels,
    };
};

export const enrichGraph = <T extends GQLNewGraph>(graph: T, labelsList: GQLLabel[]): EnrichedGraph<T> => {
    const { horizontalGroup, group } = graph;
    const ownedLabels = labelsList.filter(({ groupOwnerId }) => groupOwnerId === graph.groupOwnerId);
    const ownMapedLabels = new Map(ownedLabels.map(label => [label.id, label]));
    return {
        ...graph,
        group: enrichGroup(group, ownMapedLabels),
        horizontalGroup: horizontalGroup ? enrichGroup(horizontalGroup, ownMapedLabels) : undefined,
    };
};
