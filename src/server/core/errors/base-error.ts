import { BaseError } from 'sequelize';

export type ErrorContext = Record<string, string | number | boolean | undefined>;

interface toJSON {
    toJSON(): unknown;
}

const isToJSON = (value: unknown): value is toJSON =>
    typeof value === 'object' && value !== null && typeof (value as toJSON).toJSON === 'function';

export const errorToJson = (err: unknown | toJSON) => {
    if (isToJSON(err)) {
        return err.toJSON();
    }
    if (err instanceof Error) {
        return {
            type: 'Error2',
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    }
    return err;
};
export class CustomError extends Error {
    constructor(readonly code: string, message: string, readonly context: ErrorContext, cause?: Error) {
        super(`${code}: ${message}`, { cause });
    }

    toString() {
        return `${this.code}: ${this.message}`;
    }

    toJSON() {
        return {
            type: this.constructor.name,
            code: this.code,
            message: this.message,
            context: this.context,
            cause: this.cause ? errorToJson(this.cause) : undefined,
            stack: this.stack,
        };
    }

    enrich(context: ErrorContext): CustomError {
        return new CustomError(this.code, this.message, { ...this.context, ...context }, this);
    }
}

export const ensureOrThrow = <T extends object>(object: T | null | undefined, error: BaseError): T => {
    if (object === undefined) {
        throw error;
    }
    return object as T;
};
