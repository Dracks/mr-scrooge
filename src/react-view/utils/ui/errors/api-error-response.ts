export interface ApiErrorResponse {
    code: string;
    message: string;
}

export class WrapperApiError extends Error {
    public readonly code: string;

    constructor(error: ApiErrorResponse) {
        super(error.message);
        this.name = 'ApiError';
        this.code = error.code;
    }
}
