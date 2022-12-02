export interface GenericDSGroup<K extends string, T> {
    groupName: string;
    label: K;
    value: T;
}

export type DSGroup<K extends string> = GenericDSGroup<K, number>;

export type DSDoubleGroup<K extends string, SK extends string> = GenericDSGroup<K, DSGroup<SK>[]>;

export interface DTInputData {
    date: Date;
    tags?: number[];
    value: number;
}

export type DTGroupFn<K extends string | number> = (data: DTInputData) => K;

export type DTReduceFn = (data: DTInputData[]) => number;
