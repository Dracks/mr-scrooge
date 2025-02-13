import { GraphDateRange, GraphParam, Label } from '../../api/models';
import { useTransactionsData } from '../common/transaction.context';
import { accumulateFn } from './data-transform/accumulate';
import { createGroupWithSubGroup } from './data-transform/create-groups';
import { getRangeFilter, groupLambdas, sortLambdas } from './data-transform/lambdas';
import { sumGroups } from './data-transform/sum-groups';
import { DSDoubleGroup } from './data-transform/types';
import { EnrichedGraph } from './types';

const hashDateRange: Record<GraphDateRange, number | undefined> = {
    oneMonth: 1,
    halfYear: 6,
    oneYear: 12,
    twoYears: 24,
    sixYears: 12 * 6,
    all: undefined,
};

const normalizeSubGroups = (data: DSDoubleGroup<string, string>[]): DSDoubleGroup<string, string>[] => {
    const subGroupsKeys = new Set(data.flatMap(group => group.value.map(subGroup => subGroup.label)));

    const newData = data.map(group => {
        const newValues = [...group.value];

        const [first] = group.value;
        let { groupName } = first ?? {};

        if (!groupName) {
            groupName = '-- Unknown --';
        }

        const existingSubGroupKeys = new Set(group.value.map(subGroup => subGroup.label));
        subGroupsKeys.forEach(subKey => {
            if (!existingSubGroupKeys.has(subKey)) {
                newValues.push({
                    label: subKey,
                    groupName,
                    value: 0,
                });
            }
        });

        return {
            ...group,
            value: newValues,
        };
    });

    return newData;
};

const labelMap = ({ name }: Label) => name;

const sortData = (
    data: DSDoubleGroup<string, string>[],
    group: EnrichedGraph<GraphParam>['group'],
    horizontalGroup: EnrichedGraph<GraphParam>['horizontalGroup'],
): DSDoubleGroup<string, string>[] => {
    const groupSort = sortLambdas[group.group](group.labels?.map(labelMap) ?? []);
    if (horizontalGroup) {
        const firstSort = sortLambdas[horizontalGroup.group](horizontalGroup.labels?.map(labelMap) ?? []);
        return data
            .map(({ value, ...elem }) => ({
                ...elem,
                value: value.sort((first, second) => groupSort(first.label, second.label)),
            }))
            .sort((first, second) => firstSort(first.label, second.label));
    }
    return data.sort((first, second) => groupSort(first.label, second.label));
};

export const useGraphDataGenerator = <T extends GraphParam>({
    labelFilterId,
    dateRange,
    horizontalGroup,
    group,
    groupOwnerId,
}: EnrichedGraph<T>) => {
    const { data } = useTransactionsData();
    const monthRange: number | undefined = hashDateRange[dateRange];
    let rdsList = labelFilterId ? data.filter(rds => rds.labelIds.indexOf(labelFilterId) >= 0) : data;
    rdsList = rdsList.filter(rds => rds.groupOwnerId === groupOwnerId);
    rdsList = monthRange ? rdsList.filter(getRangeFilter(monthRange, new Date())) : rdsList;

    const groupLambda = groupLambdas[group.group](group.labels, group.hideOthers ?? false);
    const horizontalGroupLambda = horizontalGroup
        ? groupLambdas[horizontalGroup.group](horizontalGroup.labels, horizontalGroup.hideOthers ?? false)
        : groupLambdas.identity();

    const rdsGrouped = createGroupWithSubGroup(
        rdsList,
        {
            name: horizontalGroup?.group ?? 'identity',
            callback: horizontalGroupLambda,
        },
        { name: group.group, callback: groupLambda },
    );
    const rdsGroupedSum = sumGroups(rdsGrouped);
    const normalizedRdsGroupedSum = horizontalGroup ? normalizeSubGroups(rdsGroupedSum) : rdsGroupedSum;

    /*
    const sortLambda = horizontalGroup
        ? sortLambdas[horizontalGroup.group](horizontalGroup.labels?.map(labelMap) ?? [])
        : sortLambdas[group.group](group.labels?.map(labelMap) ?? []);
    let rdsSorted = normalizedRdsGroupedSum.sort((first, second) => sortLambda(first.label, second.label));
    */
    let rdsSorted = sortData(normalizedRdsGroupedSum, group, horizontalGroup);

    const { accumulate } = horizontalGroup ?? { accumulate: false };

    if (accumulate) {
        rdsSorted = accumulateFn(rdsSorted);
    }

    return rdsSorted;
};
