import { WrapperApiError } from './api-error-response';

export const useErrorMsg = (error: unknown): string => {
    if (error === null || error === undefined) {
        return 'Unknown error';
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof WrapperApiError) {
        return `${error.code}: ${error.message}`;
    }
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    if (typeof error === 'object' && 'code' in error && 'message' in error) {
        return `${String(error.code)}: ${String(error.message)}`;
    }
    let safe: string;
    try {
        safe = JSON.stringify(error);
    } catch {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        safe = String(error);
    }
    return `Type error invalid for ${safe}`;
};
