import React from 'react';

import { GQLNewGraph, useNewGraphMutation } from '../../../api/graphql/generated';
import useSessionContext from '../../session/context';
import { GraphForm } from './graph.form';

export const GraphNew = () => {
    const [, newFormRequest] = useNewGraphMutation();
    const { data: user } = useSessionContext();
    const [graphData, setGraphData] = React.useState<Partial<GQLNewGraph>>({
        groupOwnerId: user.defaultGroupId,
    });

    return (
        <GraphForm
            graphData={graphData}
            update={setGraphData}
            save={async () => {
                await newFormRequest({
                    graph: {
                        ...graphData,
                    } as GQLNewGraph,
                });
            }}
        />
    );
};
