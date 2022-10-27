import { DateRange, EnrichedGraph } from '../../api/client/graphs/types';
import { Tag } from '../../api/client/tag/types';
import { useRdsData } from '../common/raw-data-source.context';
import { accumulateFn } from './data-transform/accumulate';
import { createGroupWithSubGroup } from './data-transform/create-groups';
import { getRangeFilter, groupLambdas, sortLambdas } from './data-transform/lambdas';
import { sumGroups } from './data-transform/sum-groups';
import {DSDoubleGroup} from './data-transform/types';

const hashDateRange: Record<DateRange, number | undefined> = {
    month: 1,
    six: 6,
    year: 12,
    // eslint-disable-next-line sort-keys
    twoYears: 24,
    // eslint-disable-next-line sort-keys
    sixYears: 12 * 6,
    // eslint-disable-next-line sort-keys
    all: undefined,
};

const normalizeSubGroups = (data: DSDoubleGroup<string, string>[]): DSDoubleGroup<string, string>[]=> {
    const subGroupsKeys = new Set(data.flatMap(group=>group.value.map(subGroup => subGroup.label)));

    const newData = data.map(group => {
        const newValues = [...group.value]

        const [{groupName}] = group.value
        const existingSubGroupKeys = new Set(group.value.map(subGroup => subGroup.label))
        subGroupsKeys.forEach(subKey=> {
            if (!existingSubGroupKeys.has(subKey)){
                newValues.push({
                    label: subKey,
                    groupName,
                    value: 0
                })
            }
        })


        return {
            ...group,
            value: newValues
        }
    })

    return newData;
}

const tagMap = ({ name }: Tag) => name;

export const useGraphDataGenerator = ({ tagFilter, dateRange, horizontalGroup, group }: EnrichedGraph) => {
    const { data } = useRdsData();
    const monthRange = hashDateRange[dateRange as DateRange];
    let rdsList = tagFilter ? data.filter(rds => rds.tags.indexOf(tagFilter) >= 0) : data;
    rdsList = monthRange ? rdsList.filter(getRangeFilter(monthRange, new Date())) : rdsList;

    const groupLambda = groupLambdas[group.group](group.groupTags, group.hideOthers ?? false);
    const horizontalGroupLambda = horizontalGroup
        ? groupLambdas[horizontalGroup.group](horizontalGroup.groupTags, horizontalGroup.hideOthers ?? false)
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
    const normalizedRdsGroupedSum = horizontalGroup ? normalizeSubGroups(rdsGroupedSum): rdsGroupedSum;

    const sortLambda = horizontalGroup
        ? sortLambdas[horizontalGroup.group](horizontalGroup.groupTags.map(tagMap))
        : sortLambdas[group.group](group.groupTags.map(tagMap));
    let rdsSorted = normalizedRdsGroupedSum.sort((first, second) => sortLambda(first.label, second.label));

    const { accumulate } = horizontalGroup ?? { accumulate: false };

    if (accumulate) {
        rdsSorted = accumulateFn(rdsSorted);
    }

    return rdsSorted;
};
