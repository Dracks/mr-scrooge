import { CustomError } from '../core/errors/base-error';

export interface ListWithCursor<T> {
    list: T[];
    next?: string;
}

export class CursorHandler<T, R extends keyof T> {
    constructor(readonly fields: Array<R>) {}

    parse(cursor: string): Record<R, T[R]> {
        const data = cursor.split(':');
        return data.reduce((acc, item, idx) => {
            const field = this.fields[idx];
            if (!field) throw new CustomError('ER0001', 'Invalid cursor', { cursor, field });
            acc[field] = item as T[R];
            return acc;
        }, {} as Record<R, T[R]>);
    }

    stringify(data: Partial<Record<R, T[R]>>): string {
        return this.fields.map(field => `${data[field]}`).join(':');
    }
}
