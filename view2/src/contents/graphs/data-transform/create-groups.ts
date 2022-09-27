import { DTGroupFn, DTInputData, GenericDSGroup } from './types';

export const createGroup = <K extends string>(
    data: DTInputData[],
    lambda: { callback: DTGroupFn<K>; name: string },
): GenericDSGroup<K, DTInputData[]>[] => {
    const hashMap = {} as Record<K, DTInputData[]>;
    data.forEach(record => {
        const key = lambda.callback(record);
        if (key) {
            let group = hashMap[key];
            if (!group) {
                group = hashMap[key] = [];
            }
            group.push(record);
        } else {
            console.warn(`Not generated key for ${record} with ${lambda}`);
        }
    });
    return (Object.keys(hashMap) as K[]).map(label => ({
        label,
        value: hashMap[label],
        groupName: lambda.name,
    }));
};

export const createGroupWithSubGroup = <K extends string, SK extends string>(
    data: DTInputData[],
    lambda: { callback: DTGroupFn<K>; name: string },
    subLambda: { callback: DTGroupFn<SK>; name: string },
): GenericDSGroup<K, GenericDSGroup<SK, DTInputData[]>[]>[] => {
    const groupedData = createGroup(data, lambda);
    return groupedData.map(({ label, value, groupName }) => ({
        label,
        groupName,
        value: createGroup(value, subLambda),
    }));
};
