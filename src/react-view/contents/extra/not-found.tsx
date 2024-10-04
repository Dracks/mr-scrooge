import { Box, Heading, Text } from 'grommet';
import React from 'react';

const NotFound = () => (
    <Box direction="column" border={{ color: 'brand', size: 'small' }} pad="medium">
        <Heading>Not Found</Heading>
        <Box pad="medium" background="light-3">
            <Text></Text>
        </Box>
    </Box>
);

export default NotFound;
