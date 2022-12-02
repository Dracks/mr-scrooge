import { EnrichedGraph, EnrichedGroup, GraphGroup, GraphV2 } from '../../../api/client/graphs/types';
import { Tag } from '../../../api/client/tag/types';

export const enrichGroup = ({ groupTags: oldGroupTags, ...group }: GraphGroup, tagsList: Tag[]): EnrichedGroup => {
    const groupTagsId = oldGroupTags?.map(tag => tag.tag);
    const groupTags = tagsList.filter(tag => groupTagsId?.includes(tag.id));

    return {
        ...group,
        groupTags,
    };
};

export const enrichGraph = (graph: GraphV2, tagsList: Tag[]): EnrichedGraph => {
    const { horizontalGroup, group } = graph;
    return {
        ...graph,
        group: enrichGroup(group, tagsList),
        horizontalGroup: horizontalGroup ? enrichGroup(horizontalGroup, tagsList) : undefined,
    };
};
