import { format, lastDayOfMonth, sub } from 'date-fns';

import { GraphGroupEnum } from '../../../api/client/graphs/types';
import { Tag } from '../../../api/client/tag/types';
import { DTGroupFn, DTInputData } from './types';

export const getRangeFilter: (months: number, reference: Date) => (record: DTInputData) => boolean = (
    months: number,
    reference: Date,
) => {
    const start = sub(reference, { months });
    start.setDate(1);
    const end = lastDayOfMonth(reference);

    return record => record.date >= start && record.date <= end;
};

type GroupKeys = GraphGroupEnum;

type LabelSign = 'expenses' | 'income';

export const groupLambdas: Record<GroupKeys | 'identity', (tagsList?: Tag[], others?: boolean) => DTGroupFn<string>> = {
    month: () => record => format(record.date, 'yyyy-MM'),
    day: () => record => `${record.date.getDate()}`,
    year: () => record => `${record.date.getFullYear()}`,
    sign:
        () =>
        (record): LabelSign =>
            record.value < 0 ? 'expenses' : 'income',
    tags: (tagsList = [], hideOthers = false) => {
        const othersKey = hideOthers ? false : 'Others';
        return record => {
            const tags = record.tags ?? [];
            return (
                tagsList.reduce((ac, { id, name }) => {
                    if (!ac && tags.indexOf(id) >= 0) {
                        return name;
                    }
                    return ac;
                }, null as null | string) || (othersKey as string)
            );
        };
    },
    identity: () => () => {
        return 'identity';
    },
};

const customSort = (data: string[]) => {
    const hash = {} as Record<string, number>;
    data.forEach((name, k) => {
        hash[name] = k + 1;
    });
    return (a: string, b: string) => {
        const v1 = hash[a];
        const v2 = hash[b];
        if (!v1) {
            return 1;
        } else if (!v2) {
            return -1;
        }
        return v1 - v2;
    };
};

export const sortLambdas: Record<GroupKeys, (p: string[]) => (a: string, b: string) => number> = {
    month: () => (a: string, b: string) => a.localeCompare(b),
    day: () => (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10),
    year: () => (a: string, b: string) => a.localeCompare(b),
    sign: () => customSort(['expenses', 'income']),
    tags: customSort,
};
