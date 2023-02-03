import { DATEONLY, DateOnlyDataType, ValidationError } from 'sequelize';

import { DateOnly } from './date-only';
// import { DataType, DateOnlyDataType } from 'sequelize-typescript';

export class MyDateType extends DATEONLY implements DateOnlyDataType {
    sanitize(value: unknown): unknown {
        if (value instanceof Date) {
            return new DateOnly(value);
        }

        if (typeof value === 'string') {
            return new DateOnly(value);
        }

        if (value instanceof DateOnly) {
            return value;
        }

        throw new ValidationError('Invalid date', []);
    }

    validate(value: unknown): void {
        if (!(value instanceof DateOnly)) {
            new ValidationError('Invalid date', []);
        }

        /*
         *if (Number.isNaN(value.getTime())) {
         *ValidationErrorItem.throwDataTypeValidationError('Value is an Invalid Date');
         *}
         */
    }

    parseDatabaseValue(value: unknown): DateOnly {
        // assert(typeof value === 'string', 'Expected to receive a string from the database');
        if (typeof value === 'string') return new DateOnly(value);

        throw Error('Expected to receive a string from the database');
    }

    toBindableValue(value: DateOnly): unknown {
        return value.toString();
    }

    escape(value: DateOnly, options: {}): string {
        return value.toString();
    }
}
