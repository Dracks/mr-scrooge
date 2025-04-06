import { Box, Button, Heading } from 'grommet';
import { Edit, FormDown, FormUp, Trash } from 'grommet-icons';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../../api/client';
import { ApiUUID, Graph, MoveDirection } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { EnrichedGraph } from '../types';
import { GraphViewer } from './view';

interface GraphWrapperArgs {
    graph: EnrichedGraph<Graph>;
    reload: () => void;
    update: (graphs: Graph[]) => void;
}

export const GraphWrapperWithRechart: React.FC<GraphWrapperArgs> = ({ graph, reload, update }) => {
    const logger = useLogger('GraphWrapperWithRechart');
    const navigate = useNavigate();
    const client = useApiClient();
    const deleteCb = useAsyncCallback((id: ApiUUID) => {
        return client.DELETE('/graphs/{id}', { params: { path: { id } } });
    });
    const moveGraph = useAsyncCallback(async (id: ApiUUID, direction: MoveDirection) => {
        const response = await client.PUT('/graphs/{id}/move', { params: { path: { id } }, body: { direction } });
        if (response.response.status === 200 && response.data) {
            update(response.data.results);
        }
    });
    return (
        <Box direction="column">
            <Heading level={3}>{graph.name}</Heading>
            <GraphViewer graph={graph} />
            <Box direction="row" justify="center">
                <Button
                    icon={<FormUp />}
                    onClick={() => {
                        catchAndLog(moveGraph.execute(graph.id, 'up'), 'Moving a graph up', logger);
                    }}
                />
                <Button
                    icon={<FormDown />}
                    onClick={() => {
                        catchAndLog(moveGraph.execute(graph.id, 'down'), 'Moving a graph down', logger);
                    }}
                />
                <Button
                    icon={<Edit />}
                    onClick={() => {
                        catchAndLog(Promise.resolve(navigate(`graph/${graph.id}`)), "Navigate to edit graph", logger);
                    }}
                />
                <ConfirmationButton
                    color="accent-4"
                    icon={<Trash />}
                    onConfirm={() => {
                        deleteCb.execute(graph.id).then(
                            () => {
                                reload();
                            },
                            (error: unknown) => {
                                logger.error('Error deleting graph', error);
                            },
                        );
                    }}
                />
            </Box>
        </Box>
    );
};
