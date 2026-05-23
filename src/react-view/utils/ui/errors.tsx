import { Box, Heading, Text } from 'grommet';
import React from 'react';
import { z } from 'zod';

export const ValidationErrorsBox: React.FC<{ title: string; errors: z.ZodError }> = ({ title, errors }) => {
    return (
        <Box pad="medium" background="status-critical" round>
            <Heading level="4" color="white">
                {title}
            </Heading>
            {errors.issues.map((error, index) => (
                <Text key={index} color="white">
                    {error.path.join('.')}:{error.message}
                </Text>
            ))}
        </Box>
    );
};

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

const useErrorMsg = (error: unknown): string => {
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
    return `Type error invalid for ${JSON.stringify(error)}`;
};
export const ErrorBox: React.FC<{ title: string; error: unknown }> = ({ title, error }) => {
    const message = useErrorMsg(error);

    return (
        <Box fill align="center" justify="center" pad="large">
            <Box pad="large" background="status-critical" round>
                <Heading level="2" color="white">
                    {title}
                </Heading>
                <Text color="white">{message}</Text>
            </Box>
        </Box>
    );
};
