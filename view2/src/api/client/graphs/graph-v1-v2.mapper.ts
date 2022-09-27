import { BarGraph, Graph, GraphKind, GraphV2 } from './types';

export const graphV1V2Mapper = (graph: Graph | BarGraph): Omit<GraphV2, 'id'> => ({
    name: graph.name,
    tagFilter: graph.tag ? graph.tag : null,
    kind: graph.kind,
    dateRange: graph.dateRange,
    oldGraph: graph.id,
    group: {
        group: graph.group,
        hideOthers: graph.groupHideOthers,
        groupTags: graph.groupValue?.map(tag => ({ tag })),
    },
    horizontalGroup:
        graph.kind === GraphKind.bar || graph.kind === GraphKind.line
            ? {
                  group: (graph as BarGraph).horizontal,
                  hideOthers: (graph as BarGraph).horizontalHideOthers,
                  groupTags: (graph as BarGraph).horizontalValue?.map((tag: any) => ({ tag })),
                  accumulate: graph.acumulative,
              }
            : undefined,
});
