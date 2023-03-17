import { EnrichedGraph, EnrichedGroup } from '../../../api/client/graphs/types';
import { GQLGroup, GQLLabel, GQLNewGraph } from '../../../api/graphql/generated';

export const enrichGroup = <T extends Omit<GQLGroup, '__typename'>>({ labels: oldLabels, ...group }: T, labelsList: GQLLabel[]): EnrichedGroup => {
    const labels = labelsList.filter(label => oldLabels?.includes(label.id));

    return {
        ...group,
        labels,
    };
};

export const enrichGraph = <T extends GQLNewGraph>(graph: T, labelsList: GQLLabel[]): EnrichedGraph<T> => {
    const { horizontalGroup, group } = graph;
    const ownedLabels = labelsList.filter(({groupOwnerId})=>groupOwnerId === graph.groupOwnerId)
    return {
        ...graph,
        group: enrichGroup(group, ownedLabels),
        horizontalGroup: horizontalGroup ? enrichGroup(horizontalGroup, ownedLabels) : undefined,
    };
};
