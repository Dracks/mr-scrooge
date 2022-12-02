import { DSDoubleGroup, GenericDSGroup } from './types';

const accumulateSubGroup =
    <SK extends string>(accHash: Record<SK, number>) =>
    ({ label, value, groupName }: GenericDSGroup<SK, number>) => ({
        label,
        groupName,
        value: (accHash[label] = (accHash[label] || 0) + value),
    });

export const accumulateFn = <K extends string, SK extends string>(
    data: DSDoubleGroup<K, SK>[],
): DSDoubleGroup<K, SK>[] => {
    const accHash = {} as Record<SK, number>;
    return data.map(({ label, value, groupName }) => ({
        label,
        groupName,
        value: value.map(accumulateSubGroup(accHash)),
    }));
};
