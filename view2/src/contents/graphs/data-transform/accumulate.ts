import { km } from 'date-fns/locale';

import { DSDoubleGroup } from './types';

export const accumulateFn = <K extends string, SK extends string>(
    data: DSDoubleGroup<K, SK>[],
): DSDoubleGroup<K, SK>[] => {
    const accHash = {} as Record<SK, number>;
    return data.map(({ label, value, groupName }) => ({
        label,
        groupName,
        value: value.map(({ label, value, groupName }) => ({
            label,
            groupName,
            value: (accHash[label] = (accHash[label] || 0) + value),
        })),
    }));
};
