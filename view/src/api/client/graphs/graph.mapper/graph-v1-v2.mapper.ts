import { Graph, GraphGroup, GraphKind, GraphV2 } from '../types';

const getHorizontalGroup = (graph: Graph):GraphGroup => ({
    group: (graph as Graph).horizontal,
    hideOthers: (graph as Graph).horizontalHideOthers,
    groupTags: (graph as Graph).horizontalValue?.map((tag: number) => ({ tag })),
})

export const graphV1V2Mapper = (graph:  Graph): Omit<GraphV2, 'id'> => ({
    dateRange: graph.dateRange,
    group: graph.kind === GraphKind.pie ? getHorizontalGroup(graph) : {
        group: graph.group,
        hideOthers: graph.groupHideOthers,
        groupTags: graph.groupValue?.map(tag => ({ tag })),
    },
    horizontalGroup:
        // eslint-disable-next-line no-negated-condition
        graph.kind !== GraphKind.pie
            ? {
                  ...getHorizontalGroup(graph),
                  accumulate: graph.acumulative,
              }
            : undefined,
    kind: graph.kind,
    name: graph.name,
    oldGraph: graph.id,
    tagFilter: graph.tag ? graph.tag : null,
});
