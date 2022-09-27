import { Box, Button, Heading } from 'grommet';
import { Edit, Trash } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { EnrichedGraph } from '../../../api/client/graphs/types';
import { useDeleteGraphsV2 } from '../../../api/client/graphs/use-delete-graphs-v2';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { GraphViewer } from './view';

interface GraphWrapperArgs {
    graph: EnrichedGraph;
    reload: () => Promise<void>;
}

export const GraphWrapperWithRechart: React.FC<GraphWrapperArgs> = ({ graph, reload }) => {
    const navigate = useNavigate();
    const [, deleteRequest] = useDeleteGraphsV2(graph.id);
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
                        await deleteRequest();
                        reload();
                    }}
                />
            </Box>
        </Box>
    );
};
