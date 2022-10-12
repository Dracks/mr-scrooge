import { Graph, GraphGroup, GraphGroupEnum, GraphKind, GraphV2 } from '../types';

const getHorizontalGroup = (graph: Graph):GraphGroup => ({
    group: (graph as Graph).horizontal,
    hideOthers: (graph as Graph).horizontalHideOthers,
    groupTags: (graph as Graph).horizontalValue?.map((tag: any) => ({ tag })),
})

export const graphV1V2Mapper = (graph:  Graph): Omit<GraphV2, 'id'> => ({
    name: graph.name,
    tagFilter: graph.tag ? graph.tag : null,
    kind: graph.kind,
    dateRange: graph.dateRange,
    oldGraph: graph.id,
    group: graph.kind === GraphKind.pie ? getHorizontalGroup(graph) : {
        group: graph.group,
        hideOthers: graph.groupHideOthers,
        groupTags: graph.groupValue?.map(tag => ({ tag })),
    },
    horizontalGroup:
        graph.kind !== GraphKind.pie
            ? {
                  ...getHorizontalGroup(graph),
                  accumulate: graph.acumulative,
              }
            : undefined,
});
