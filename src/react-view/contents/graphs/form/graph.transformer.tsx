import { GraphDateRange, GraphKind, GraphParam, Group, GroupType, HorizontalGroup } from '../../../api/models';

export interface GraphUiRepresentation {
    dateRange?: GraphDateRange;
    groupHideOthers?: boolean;
    groupType?: GroupType;
    groupLabels?: string[];
    horizontalAccumulate?: boolean;
    horizontalGroupHideOthers?: boolean;

    horizontalGroupType?: GroupType;
    horizontalGroupLabels?: string[];
    id?: number;

    kind?: GraphKind;
    labelFilterId?: string;
    name?: string;
}

export const graphToUi = ({
    group,
    horizontalGroup,
    kind,
    labelFilterId: tagFilter,
    ...graph
}: Partial<GraphParam>): GraphUiRepresentation => ({
    ...graph,
    groupHideOthers: group?.hideOthers,
    groupType: group?.group,
    groupLabels: group?.labels,
    horizontalAccumulate: horizontalGroup?.accumulate,
    horizontalGroupHideOthers: horizontalGroup?.hideOthers,
    horizontalGroupType: horizontalGroup?.group,
    horizontalGroupLabels: horizontalGroup?.labels,
    kind,
    labelFilterId: tagFilter,
});

export const uiToGraph = ({
    groupType: groupKind,
    groupHideOthers,
    groupLabels,
    horizontalGroupHideOthers,
    horizontalGroupType,
    horizontalGroupLabels,
    horizontalAccumulate,
    ...graphUi
}: GraphUiRepresentation): Partial<GraphParam> => ({
    ...graphUi,
    group: groupKind
        ? ({
              group: groupKind,
              hideOthers: groupHideOthers,
              labels: groupLabels,
          } as Group)
        : undefined,
    horizontalGroup:
        horizontalGroupType && graphUi.kind !== 'pie'
            ? ({
                  group: horizontalGroupType,
                  hideOthers: horizontalGroupHideOthers,
                  labels: horizontalGroupLabels,
                  accumulate: horizontalAccumulate,
              } as HorizontalGroup)
            : undefined,
});
