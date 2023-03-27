import { EnrichedGraph } from '../../api/client/graphs/types';
import { GQLGraphDateRange, GQLLabel, GQLNewGraph } from '../../api/graphql/generated';
import { useRdsData } from '../common/raw-data-source.context';
import { accumulateFn } from './data-transform/accumulate';
import { createGroupWithSubGroup } from './data-transform/create-groups';
import { getRangeFilter, groupLambdas, sortLambdas } from './data-transform/lambdas';
import { sumGroups } from './data-transform/sum-groups';
import { DSDoubleGroup } from './data-transform/types';

const hashDateRange: Record<GQLGraphDateRange, number | undefined> = {
    [GQLGraphDateRange.OneMonth]: 1,
    [GQLGraphDateRange.HalfYear]: 6,
    [GQLGraphDateRange.OneYear]: 12,
    // eslint-disable-next-line sort-keys
    [GQLGraphDateRange.TwoYears]: 24,
    // eslint-disable-next-line sort-keys
    [GQLGraphDateRange.SixYears]: 12 * 6,
    // eslint-disable-next-line sort-keys
    [GQLGraphDateRange.All]: undefined,
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

const labelMap = ({ name }: GQLLabel) => name;

export const useGraphDataGenerator = <T extends GQLNewGraph>({ labelFilter, dateRange, horizontalGroup, group, groupOwnerId }: EnrichedGraph<T>) => {
    const { data } = useRdsData();
    const monthRange = hashDateRange[dateRange];
    let rdsList = labelFilter ? data.filter(rds => rds.labelIds.indexOf(labelFilter) >= 0) : data;
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

    const sortLambda = horizontalGroup
        ? sortLambdas[horizontalGroup.group](horizontalGroup.labels.map(labelMap))
        : sortLambdas[group.group](group.labels.map(labelMap));
    let rdsSorted = normalizedRdsGroupedSum.sort((first, second) => sortLambda(first.label, second.label));

    const { accumulate } = horizontalGroup ?? { accumulate: false };

    if (accumulate) {
        rdsSorted = accumulateFn(rdsSorted);
    }

    return rdsSorted;
};
