import { Box, Text } from 'grommet';
import React from 'react';

import { useErrorMsg } from './use-error-msg';

export const SmallErrorBox: React.FC<{ error: unknown }> = ({ error }) => {
    const message = useErrorMsg(error);

    return (
        <Box pad="small" background="status-critical" round>
            <Text color="white" size="small">
                {message}
            </Text>
        </Box>
    );
};
