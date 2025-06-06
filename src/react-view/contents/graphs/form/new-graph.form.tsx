import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../../api/client';
import { GraphInput } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { useUserProfileOrThrows } from '../../../utils/session/session-context';
import { GraphForm } from './graph.form';

export const GraphNew = () => {
    const logger = useLogger('GraphNew');
    const client = useApiClient();
    const newFormRequest = useAsyncCallback((graph: GraphInput) => {
        return client.POST('/graphs', { body: graph });
    });
    const userProfile = useUserProfileOrThrows();
    const navigate = useNavigate();
    const [graphData, setGraphData] = React.useState<Partial<GraphInput>>({
        groupOwnerId: userProfile.defaultGroupId,
    });

    return (
        <GraphForm
            graphData={graphData}
            update={setGraphData}
            save={() => {
                newFormRequest.execute(graphData as GraphInput).then(
                    async response => {
                        const newGraph = response.data;
                        if (newGraph) {
                            await navigate(`../${newGraph.id}`);
                        } else {
                            logger.error('Some error on the request', { error: response.error });
                        }
                    },
                    (error: unknown) => {
                        logger.error('Cannot create the new graph', { error });
                    },
                );
            }}
        />
    );
};
