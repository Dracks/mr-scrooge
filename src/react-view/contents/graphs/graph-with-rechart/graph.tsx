import { Box, Button, Heading } from 'grommet';
import { Edit, Trash } from 'grommet-icons';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApi } from '../../../api/client';
import { ApiUUID, Graph } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { EnrichedGraph } from '../types';
import { GraphViewer } from './view';

interface GraphWrapperArgs {
    graph: EnrichedGraph<Graph>;
    reload: () => void;
}

export const GraphWrapperWithRechart: React.FC<GraphWrapperArgs> = ({ graph, reload }) => {
    const logger = useLogger();
    const navigate = useNavigate();
    const client = useApi()
    const deleteCb = useAsyncCallback((id: ApiUUID)=>{
        return client.DELETE("/graphs/{id}", {params: {path: {id}}})
    });
    return (
        <Box direction="column">
            <Heading level={3}>{graph.name}</Heading>
            <GraphViewer graph={graph} />
            <Box direction="row" justify="center">
                <Button
                    icon={<Edit />}
                    onClick={() => {
                        navigate(`graph/${graph.id}`);
                    }}
                />
                <ConfirmationButton
                    color="accent-4"
                    icon={<Trash />}
                    onConfirm={() => {
                        deleteCb.execute( graph.id ).then(()=>{
                            reload();
                        }, (error: unknown) => {
                            logger.error("Error deleting graph", error)
                        });
                    }}
                />
            </Box>
        </Box>
    );
};
