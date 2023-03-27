import { DateOnly } from './date-only';

describe(DateOnly.name, () => {
    const cases = it.each([
        ['string', '2019-10-01', undefined, undefined, '2019-10-01'],
        ['number', 2019, 11, 20, '2019-11-20'],
        ['date', new Date('2019-07-20'), undefined, undefined, '2019-07-20'],
    ]);

    cases('test %s args (%s, %s, %s) should be %s', (_text, year, month, day, expected) => {
        const dateOnly = new DateOnly(year, month, day);
        expect(dateOnly.toString()).toEqual(expected);
        expect(dateOnly.getDate().toISOString()).toEqual(`${expected}T00:00:00.000Z`);
    });
});
