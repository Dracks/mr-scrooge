import { Box, Heading, Text } from 'grommet';
import React from 'react';
import { useParams } from 'react-router';

import { StatusReport } from '../../../api/client/imports/types';

interface ImportDetailsArgs {
    status: StatusReport;
}

export const ImportDetails: React.FC<ImportDetailsArgs> = ({ status }) => {
    return (
        <Box fill>
            <Heading level="2">{status.fileName}</Heading>
            <Text>{status.date}</Text>
        </Box>
    );
};
