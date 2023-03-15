import { EnrichedGraph, EnrichedGroup, GraphGroup, GraphV2 } from '../../../api/client/graphs/types';
import { Tag } from '../../../api/client/tag/types';

export const enrichGroup = ({ groupTags: oldGroupTags, ...group }: GraphGroup, tagsMap: Map<number, Tag>): EnrichedGroup => {
    const groupTags = oldGroupTags?.map(tag => tagsMap.get(tag.tag)).filter(Boolean) as Tag[] ?? [];

    return {
        ...group,
        groupTags,
    };
};

export const enrichGraph = (graph: GraphV2, tagsMap: Map<number, Tag>): EnrichedGraph => {
    const { horizontalGroup, group } = graph;
    return {
        ...graph,
        group: enrichGroup(group, tagsMap),
        horizontalGroup: horizontalGroup ? enrichGroup(horizontalGroup, tagsMap) : undefined,
    };
};
