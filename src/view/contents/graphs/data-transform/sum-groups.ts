import { DSDoubleGroup, DSGroup, DTInputData, GenericDSGroup } from './types';

export const sumSubGroups = <K extends string>(data: GenericDSGroup<K, DTInputData[]>[]): DSGroup<K>[] =>
    data.map(({ label, value, groupName }) => ({
        label,
        groupName,
        value: Math.abs(value.reduce((ac: number, record: DTInputData) => ac + record.value, 0)),
    }));

export const sumGroups = <K extends string, SK extends string>(
    data: GenericDSGroup<K, GenericDSGroup<SK, DTInputData[]>[]>[],
): DSDoubleGroup<K, SK>[] =>
    data.map(({ label, value, groupName }) => ({
        label,
        groupName,
        value: sumSubGroups(value),
    }));
