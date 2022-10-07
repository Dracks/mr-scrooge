import React from 'react';

import { GraphV2 } from '../../../api/client/graphs/types';
import { usePostGraphsV2 } from '../../../api/client/graphs/use-post-graphs-v2';
import { usePutGraphsV2 } from '../../../api/client/graphs/use-put-graphs-v2';
import { GraphForm } from './graph.form';

export const GraphNew = () => {
    const [graphData, setGraphData] = React.useState<Partial<GraphV2>>({});
    const [, newFormRequest] = usePostGraphsV2();

    return (
        <GraphForm
            graphData={graphData}
            update={setGraphData}
            save={async () => {
                await newFormRequest({
                    data: graphData,
                });
            }}
        />
    );
};
