import { Box, Heading } from 'grommet';
import React from 'react';

import { StatusReport } from '../../../api/client/imports/types';
import { useGetStatusRows } from '../../../api/client/imports/use-get-status-rows';
import { useLogger } from '../../../utils/logger/logger.context';
import { LoadingPage } from '../../../utils/ui/loading';
import { DetailsLoaded } from './details-loaded';

interface ImportDetailsArgs {
    status: StatusReport;
}

export const ImportDetails: React.FC<ImportDetailsArgs> = ({ status }) => {
    const logger = useLogger();
    const [request] = useGetStatusRows(status.rows);

    if (request.loading) {
        return <LoadingPage />;
    } else if (request.data) {
        return <DetailsLoaded status={status} rows={request.data} />;
    }
    logger.error('Error loading the status-rows of imports', { error: request.error });
    return (
        <Box fill>
            <Heading level="2">Error loading: {status.fileName}</Heading>
            Something happened
        </Box>
    );
};
