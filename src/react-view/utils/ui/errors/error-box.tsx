import { Box, Heading, Text } from 'grommet';
import React from 'react';

import { useErrorMsg } from './use-error-msg';

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
