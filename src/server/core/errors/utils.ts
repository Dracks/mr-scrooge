import { Exception } from './exception';

export const ensureOrThrow = <T extends object | string | number | symbol>(
    object: T | null | undefined,
    error: Exception,
): T => {
    if (object === undefined) {
        throw error;
    }
    return object as T;
};
