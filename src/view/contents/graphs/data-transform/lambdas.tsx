/* eslint-disable sort-keys */
import { format, lastDayOfMonth, sub } from 'date-fns';

import { GQLGraphGroup, GQLLabel } from '../../../api/graphql/generated';
import { DTGroupFn, DTInputData } from './types';

export const getRangeFilter: (months: number, reference: Date) => (record: DTInputData) => boolean = (
    months: number,
    reference: Date,
) => {
    const start = sub(reference, { months: months - 1 });
    start.setDate(1);
    const end = lastDayOfMonth(reference);

    return record => record.date >= start && record.date <= end;
};

type GroupKeys = GQLGraphGroup;

type LabelSign = 'expenses' | 'income';

export const groupLambdas: Record<
    GroupKeys | 'identity',
    (labelsList?: GQLLabel[], others?: boolean) => DTGroupFn<string>
> = {
    [GQLGraphGroup.Month]: () => record => format(record.date, 'yyyy-MM'),
    [GQLGraphGroup.Day]: () => record => `${record.date.getDate()}`,
    [GQLGraphGroup.Year]: () => record => `${record.date.getFullYear()}`,
    [GQLGraphGroup.Sign]:
        () =>
        (record): LabelSign =>
            record.value < 0 ? 'expenses' : 'income',
    [GQLGraphGroup.Labels]: (labelsList = [], hideOthers = false) => {
        const othersKey = hideOthers ? false : 'Others';
        return record => {
            const tags = record.labelIds ?? [];
            return (
                labelsList.reduce((ac, { id, name }) => {
                    if (!ac && tags.indexOf(id) >= 0) {
                        return name;
                    }
                    return ac;
                }, null as null | string) ?? (othersKey as string)
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
    [GQLGraphGroup.Month]: () => (a: string, b: string) => a.localeCompare(b),
    [GQLGraphGroup.Day]: () => (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10),
    [GQLGraphGroup.Year]: () => (a: string, b: string) => a.localeCompare(b),
    [GQLGraphGroup.Sign]: () => customSort(['expenses', 'income']),
    [GQLGraphGroup.Labels]: customSort,
};
