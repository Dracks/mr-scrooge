export function isType<T>(error: T | undefined): error is T {
    return error !== undefined;
}
