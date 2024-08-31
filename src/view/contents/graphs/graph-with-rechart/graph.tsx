import { Box, Button, Heading } from 'grommet';
import { Edit, Trash } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { EnrichedGraph } from '../../../api/client/graphs/types';
import { GQLGraph, useDeleteGraphMutation } from '../../../api/graphql/generated';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { GraphViewer } from './view';

interface GraphWrapperArgs {
    graph: EnrichedGraph<GQLGraph>;
    reload: () => Promise<void> | void;
}

export const GraphWrapperWithRechart: React.FC<GraphWrapperArgs> = ({ graph, reload }) => {
    const navigate = useNavigate();
    const [, deleteRequest] = useDeleteGraphMutation();
    return (
        <Box direction="column">
            <Heading level={3}>{graph.name}</Heading>
            <GraphViewer graph={graph} />
            <Box direction="row" justify="center">
                <Button icon={<Edit />} onClick={() => navigate(`graph/${graph.id}`)} />
                <ConfirmationButton
                    color="accent-4"
                    icon={<Trash />}
                    onConfirm={async () => {
                        await deleteRequest({ graphId: graph.id });
                        await reload();
                    }}
                />
            </Box>
        </Box>
    );
};
