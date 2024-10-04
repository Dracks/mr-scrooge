import { GQLGraphDateRange, GQLGraphGroup, GQLGraphKind, GQLNewGraph } from '../../../api/graphql/generated';

export interface GraphUiRepresentation {
    dateRange?: GQLGraphDateRange;
    groupHideOthers?: boolean | null;
    groupKind?: GQLGraphGroup;
    groupLabels?: string[];
    horizontalAccumulate?: boolean;
    horizontalGroupHideOthers?: boolean | null;

    horizontalGroupKind?: GQLGraphGroup;
    horizontalGroupLabels?: string[];
    id?: number;

    kind?: GQLGraphKind;
    labelFilterId?: string | null;
    name?: string;
}

export const graphToUi = ({
    group,
    horizontalGroup,
    kind,
    labelFilterId: tagFilter,
    ...graph
}: Partial<GQLNewGraph>): GraphUiRepresentation => ({
    ...graph,
    groupHideOthers: group?.hideOthers,
    groupKind: group?.group as GQLGraphGroup,
    groupLabels: group?.labels ?? undefined,
    horizontalAccumulate: horizontalGroup?.accumulate ?? undefined,
    horizontalGroupHideOthers: horizontalGroup?.hideOthers,
    horizontalGroupKind: horizontalGroup?.group as GQLGraphGroup,
    horizontalGroupLabels: horizontalGroup?.labels ?? undefined,
    kind,
    labelFilterId: tagFilter ?? undefined,
});

export const uiToGraph = ({
    groupKind,
    groupHideOthers,
    groupLabels,
    horizontalGroupHideOthers,
    horizontalGroupKind,
    horizontalGroupLabels,
    horizontalAccumulate,
    ...graphUi
}: GraphUiRepresentation): Partial<GQLNewGraph> => ({
    ...graphUi,
    group: groupKind
        ? {
              group: groupKind,
              hideOthers: groupHideOthers,
              labels: groupLabels,
          }
        : undefined,
    horizontalGroup:
        horizontalGroupKind && graphUi.kind !== GQLGraphKind.Pie
            ? {
                  group: horizontalGroupKind,
                  hideOthers: horizontalGroupHideOthers,
                  labels: horizontalGroupLabels,
                  accumulate: horizontalAccumulate,
              }
            : undefined,
});
