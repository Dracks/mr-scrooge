import { format, lastDayOfMonth, sub } from 'date-fns';

import { GroupType, Label } from '../../../api/models';
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

type GroupKeys = GroupType;

type LabelSign = 'expenses' | 'income';

export const groupLambdas: Record<
    GroupKeys | 'identity',
    (labelsList?: Label[], others?: boolean) => DTGroupFn<string>
> = {
    month: () => record => format(record.date, 'yyyy-MM'),
    day: () => record => String(record.date.getDate()),
    year: () => record => String(record.date.getFullYear()),
    sign:
        () =>
        (record): LabelSign =>
            record.value < 0 ? 'expenses' : 'income',
    labels: (labelsList = [], hideOthers = false) => {
        const othersKey = hideOthers ? false : 'Others';
        return record => {
            const tags = record.labelIds ?? [];
            return (
                labelsList.reduce<null | string>((ac, { id, name }) => {
                    if (!ac && tags.indexOf(id) >= 0) {
                        return name;
                    }
                    return ac;
                }, null) ?? (othersKey as string)
            );
        };
    },
    identity: () => () => {
        return 'identity';
    },
};

const customSort = (data: string[]) => {
    const map = new Map<string, number>(data.map((elem, key) => [elem, key + 1]));
    return (a: string, b: string) => {
        const v1 = map.get(a);
        const v2 = map.get(b);
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
    sign: () => customSort(['income', 'expenses']),
    labels: customSort,
};
