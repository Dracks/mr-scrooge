import { Box, Spinner } from 'grommet';
import React from 'react';

const Loading = () => <Spinner size="xl" />;

export const LoadingPage = () => (
    <Box align="center">
        <Box align="center">
            <Loading />
        </Box>
    </Box>
);
export default Loading;
