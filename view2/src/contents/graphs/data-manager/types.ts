export interface DMData {
    date: Date,
    value: number,
    tags?: number[]
}

export type DMGroupFn<T> = (data: DMData)=>T

export type DMReduceFn = (data: DMData[]) => number