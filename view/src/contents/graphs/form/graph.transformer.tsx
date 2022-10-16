import { GraphGroupEnum, GraphKind, GraphV2 } from '../../../api/client/graphs/types';

export interface GraphUiRepresentation {
    dateRange?: string;
    groupHideOthers?: boolean | null;
    groupKind?: GraphGroupEnum;
    groupTags?: number[];
    horizontalAccumulate?: boolean;
    horizontalGroupHideOthers?: boolean | null;

    horizontalGroupKind?: GraphGroupEnum;
    horizontalGroupTags?: number[];
    id?: number;

    kind?: GraphKind;
    name?: string;
    oldGraph?: number | null;
    tagFilter?: number | null;
}

export const graphToUi = ({
    group,
    horizontalGroup,
    kind,
    tagFilter,
    ...graph
}: Partial<GraphV2>): GraphUiRepresentation => ({
    ...graph,
    groupHideOthers: group?.hideOthers,
    groupKind: group?.group as GraphGroupEnum,
    groupTags: group?.groupTags?.map(({ tag }) => tag),
    horizontalAccumulate: horizontalGroup?.accumulate,
    horizontalGroupHideOthers: horizontalGroup?.hideOthers,
    horizontalGroupKind: horizontalGroup?.group as GraphGroupEnum,
    horizontalGroupTags: horizontalGroup?.groupTags?.map(({ tag }) => tag),
    kind: kind as GraphKind,
    tagFilter: tagFilter ?? undefined,
});

export const uiToGraph = ({
    groupKind,
    groupHideOthers,
    groupTags,
    horizontalGroupHideOthers,
    horizontalGroupKind,
    horizontalGroupTags,
    horizontalAccumulate,
    oldGraph,
    ...graphUi
}: GraphUiRepresentation): Partial<GraphV2> => ({
    ...graphUi,
    oldGraph: oldGraph ?? undefined,
    group: groupKind
        ? {
              group: groupKind,
              hideOthers: groupHideOthers,
              groupTags: groupTags?.map(tag => ({ tag })),
          }
        : undefined,
    horizontalGroup:
        horizontalGroupKind && graphUi.kind !== GraphKind.bar
            ? {
                  group: horizontalGroupKind,
                  hideOthers: horizontalGroupHideOthers,
                  groupTags: horizontalGroupTags?.map(tag => ({ tag })),
                  accumulate: horizontalAccumulate,
              }
            : undefined,
});
