import { DTGroupFn, DTInputData, GenericDSGroup } from './types';

export const createGroup = <K extends string>(
    data: DTInputData[],
    lambda: { callback: DTGroupFn<K>; name: string },
): GenericDSGroup<K, DTInputData[]>[] => {
    const hashMap = new Map<K, DTInputData[]>();
    data.forEach(record => {
        const key = lambda.callback(record);
        if (key) {
            let group = hashMap.get(key);
            if (!group) {
                group = [];
                hashMap.set(key, group);
            }
            group.push(record);
        }
    });
    return Array.from(hashMap.keys()).map(
        label =>
            ({
                label,
                value: hashMap.get(label),
                groupName: lambda.name,
            }) as GenericDSGroup<K, DTInputData[]>,
    );
};

export const createGroupWithSubGroup = <K extends string, SK extends string>(
    data: DTInputData[],
    lambda: { callback: DTGroupFn<K>; name: string },
    subLambda: { callback: DTGroupFn<SK>; name: string },
): GenericDSGroup<K, GenericDSGroup<SK, DTInputData[]>[]>[] => {
    const groupedData = createGroup(data, lambda);
    return groupedData
        .map(({ label, value, groupName }) => ({
            label,
            groupName,
            value: createGroup(value, subLambda),
        }))
        .filter(group => group.value.length > 0);
};
