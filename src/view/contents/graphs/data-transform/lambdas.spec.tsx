import { parse } from 'date-fns';

import { GQLLabel } from '../../../api/graphql/generated';
import { getRangeFilter, groupLambdas, sortLambdas } from './lambdas';
import { DTInputData } from './types';

describe('[Lambdas]', () => {
    describe('Group Lambdas', () => {
        let data = new Array<DTInputData & { name: string }>();
        const subject = groupLambdas;

        beforeEach(() => {
            data = [
                { labelIds: [1, 32], name: 'Daleks', value: 1, date: new Date() },
                { labelIds: [12, 2], name: 'Pace keepers', value: 2, date: new Date() },
                { labelIds: [43], name: 'Cylons', value: 3, date: new Date() },
                { labelIds: [1, 2, 3], name: 'Prota', value: 4, date: new Date() },
                { labelIds: [3], name: 'Reapers', value: 5, date: new Date() },
            ];
        });

        it('Group by tags', () => {
            const labels = [
                { id: 1, name: 'Dr Who' },
                { id: 2, name: 'Farscape' },
                { id: 3, name: 'Firefly' },
            ] as Partial<GQLLabel>[] as GQLLabel[];

            let result = data.map(subject.Labels(labels, false));

            expect(result).toEqual(['Dr Who', 'Farscape', 'Others', 'Dr Who', 'Firefly']);

            result = data.map(subject.Labels(labels, true));

            expect(result).toEqual(['Dr Who', 'Farscape', false, 'Dr Who', 'Firefly']);
        });
    });

    describe('Range filter', () => {
        let subject: (record: DTInputData) => boolean;
        const formatStr = 'yyyy-MM-dd';
        const check = (date: string, value: boolean) => {
            expect(subject({ date: parse(date, formatStr, new Date('2022-01-01T12:00:00.000Z')), value: 1 })).toBe(
                value,
            );
        };
        describe('less than one month from 2016-07-01', () => {
            beforeEach(() => {
                const ref = parse('2016-07-01', formatStr, new Date('2022-01-01T00:00:00.000Z'));
                subject = getRangeFilter(1, ref);
            });

            it.each([
                ['2016-07-31', true],
                ['2016-07-01', true],
                ['2016-06-30', false],
                ['2016-08-01', false],
            ])('Check %s is %s', check);
        });

        describe('less than three month old from 2016-07-01', () => {
            beforeEach(() => {
                const ref = parse('2016-07-01', formatStr, new Date('2022-01-01T00:00:00.000Z'));
                subject = getRangeFilter(3, ref);
            });

            it.each([
                ['2016-07-31', true],
                ['2016-05-01', true],
                ['2016-04-30', false],
                ['2016-08-01', false],
            ])('Check %s is %s', check);
        });
    });

    describe('Sort Lambdas', () => {
        const subject = sortLambdas;
        const valuesToSort = ['pum', 'ping', 'pam'];

        it('sort customized with all the same', () => {
            const data = ['ping', 'pam', 'pum'];
            const result = data.sort(subject.Labels(valuesToSort));
            expect(result).toEqual(['pum', 'ping', 'pam']);
        });

        it('sort customized with others', () => {
            const data = ['ping', 'others', 'pam', 'pum'];
            const result = data.sort(subject.Labels(valuesToSort));
            expect(result).toEqual(['pum', 'ping', 'pam', 'others']);
        });
    });
});
