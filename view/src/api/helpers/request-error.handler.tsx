import { AxiosError } from 'axios';
import { Heading, Main } from 'grommet';
import React from 'react';

interface ErrorHandlerProps {
    error: AxiosError<unknown>;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error }) => {
    return (
        <Main pad="small">
            <Heading>{error.name}</Heading>
            <Heading level={2}>{error.message}</Heading>
            <pre>{error.stack}</pre>
        </Main>
    );
};

export default ErrorHandler;
