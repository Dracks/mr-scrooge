import { DMData, DMGroupFn, DMReduceFn } from './types';

const getGroupByLambda = <T extends string | number>(data: DMData[], lambda: DMGroupFn<T>): Record<T, DMData[]> => {
    const retData = {} as Record<T, DMData[]>;
    data.forEach(e => {
        const key = lambda(e);
        if (key) {
            let group = retData[key];
            if (!group) {
                group = retData[key] = [];
            }
            group.push(e);
        }
    });
    return retData;
};

class DataManagerGrouped<T extends string | number> {
    constructor(private data: Record<T, DMData[]>) {}
}

class DMReduced<T1 extends string | number, T2 extends string | number> {
    constructor(private data: Record<T1, Record<T2, number>>) {}

    public accumulate() {
        this.data.forEach(e => {
            let acum = 0;
            e.data = (e.data as number[]).map(e1 => {
                acum += e1;
                return acum as number;
            });
        });
        return this;
    }
}

class DataManagerDoubleGrouped<T1 extends string | number, T2 extends string | number> {
    constructor(private data: Record<T1, Record<T2, DMData[]>>) {}

    public reduceGroups(callback: DMReduceFn) {
        const newData = {} as Record<T1, Record<T2, number>>;
        const { data } = this;
        (Object.keys(data) as T1[]).forEach(keyFirst => {
            const subGroup: Record<T2, DMData[]> = data[keyFirst];
            newData[keyFirst] = (Object.keys(subGroup) as T2[]).reduce((acc, keySecond) => {
                acc[keySecond] = callback(subGroup[keySecond]);
                return acc;
            }, {} as Record<T2, number>);
        });
        return new DMReduced(newData);
    }
}

export class DataManage {
    constructor(private data: DMData[]) {}

    public get() {
        return this.data;
    }

    public groupByLambda<T extends string | number>(lambda: DMGroupFn<T>) {
        const newData = getGroupByLambda(this.data, lambda);
        return new DataManagerGrouped(newData);
    }

    public groupForGraph<T1 extends string | number, T2 extends string | number>(
        firstLambda: DMGroupFn<T1>,
        secondLambda: DMGroupFn<T2>,
    ) {
        const firstGroup = getGroupByLambda(this.data, firstLambda);
        const grouped = (Object.keys(firstGroup) as T1[]).reduce((ac, key) => {
            const values = firstGroup[key];
            ac[key] = getGroupByLambda(values, secondLambda);
            return ac;
        }, {} as Record<T1, Record<T2, DMData[]>>);
        return new DataManagerDoubleGrouped(grouped);
    }
}

export default DataManage;
