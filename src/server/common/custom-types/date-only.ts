/* eslint-disable no-underscore-dangle */
const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

export class DateOnly {
    private _year!: number;

    private _month!: number;

    private _day!: number;

    private assign(date: Date) {
        this._year = date.getFullYear();
        this._month = date.getMonth() + 1;
        this._day = date.getDate();
    }

    /*
     * constructor(date: Date | string | number)
     * constructor(year: number, month: number, day: number)
     */
    constructor(date: string | Date | number, month?: undefined | number, day?: undefined | number) {
        if (
            (typeof date === 'string' || typeof date === 'number') &&
            typeof month === 'undefined' &&
            typeof day === 'undefined'
        ) {
            this.assign(new Date(date));
        } else if (typeof date === 'number' && typeof month === 'number' && typeof day === 'number') {
            this.assign(new Date(date, month - 1, day));
        } else if (date instanceof Date) {
            this.assign(date);
        } else {
            throw new Error(`Invalid date format (${date},${month},${day})`);
        }
    }

    /**
     *
     * @returns {Date} a date set in UTC format
     */
    getDate(): Date {
        const date = new Date(0, 0, 0, 0, 0, 0, 0);
        // return new Date(this._year, this._month-1, this._day, 0, 0, 0, 0)
        date.setUTCFullYear(this._year);
        date.setUTCMonth(this._month - 1);
        date.setUTCDate(this._day);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        return date;
    }

    toString(): string {
        return `${this._year}-${zeroPad(this._month, 2)}-${zeroPad(this._day, 2)}`;
    }
}
