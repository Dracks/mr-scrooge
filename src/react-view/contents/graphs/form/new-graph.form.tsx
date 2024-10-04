import React from 'react';
import { useNavigate } from 'react-router';

import { GQLNewGraph, useNewGraphMutation } from '../../../api/graphql/generated';
import useSessionContext from '../../session/context';
import { GraphForm } from './graph.form';

export const GraphNew = () => {
    const [, newFormRequest] = useNewGraphMutation();
    const { data: user } = useSessionContext();
    const navigate = useNavigate();
    const [graphData, setGraphData] = React.useState<Partial<GQLNewGraph>>({
        groupOwnerId: user.defaultGroupId,
    });

    return (
        <GraphForm
            graphData={graphData}
            update={setGraphData}
            save={async () => {
                const { data } = await newFormRequest({
                    graph: graphData,
                });
                const { newGraph } = data ?? {};

                if (newGraph?.__typename === 'Graph') {
                    navigate(`../${newGraph.id}`);
                }
            }}
        />
    );
};
