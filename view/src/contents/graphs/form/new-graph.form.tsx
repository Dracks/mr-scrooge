import React from 'react';
import { useNavigate } from 'react-router';

import { GraphV2 } from '../../../api/client/graphs/types';
import { usePostGraphsV2 } from '../../../api/client/graphs/use-post-graphs-v2';
import { GraphForm } from './graph.form';

export const GraphNew = () => {
    const [graphData, setGraphData] = React.useState<Partial<GraphV2>>({});
    const [, newFormRequest] = usePostGraphsV2();
    const navigate = useNavigate();

    return (
        <GraphForm
            graphData={graphData}
            update={setGraphData}
            save={async () => {
                const newGraphData = await newFormRequest({
                    data: graphData,
                });
                navigate(`../${newGraphData.data.id}`);
            }}
        />
    );
};
