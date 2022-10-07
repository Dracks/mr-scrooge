export interface DMData {
    date: Date;
    tags?: number[];
    value: number;
}

export type DMGroupFn<T> = (data: DMData) => T;

export type DMReduceFn = (data: DMData[]) => number;
