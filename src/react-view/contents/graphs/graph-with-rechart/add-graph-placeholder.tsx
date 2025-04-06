import { Box, Button, Heading } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';

export const AddGraphPlaceholder = () => {
    const navigate = useNavigate();
    const logger = useLogger("Add Graph Placeholder")
    return (
        <Box direction="column" pad="small" data-testid="add-graph-placeholder">
            <Heading level={3}>Add a new graph</Heading>
            <Box height={'400px'} width="fill" background="light-2" justify="center" align="center">
                <Button
                    icon={<Add size="large" />}
                    onClick={() => {
                        catchAndLog(Promise.resolve(navigate(`/graph/new-graph`)), "Navigate to new graph", logger);
                    }}
                />
            </Box>
        </Box>
    );
};
