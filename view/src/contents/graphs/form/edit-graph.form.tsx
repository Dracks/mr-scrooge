import React from 'react';

import { GraphV2 } from '../../../api/client/graphs/types';
import { useGetGraphV2 } from '../../../api/client/graphs/use-get-graph-v2';
import { usePutGraphsV2 } from '../../../api/client/graphs/use-put-graphs-v2';
import { LoadingPage } from '../../../utils/ui/loading';
import { GraphForm } from './graph.form';

interface EditGraphProps {
    id: number;
}
export const EditGraph: React.FC<EditGraphProps> = ({ id }) => {
    const [graph] = useGetGraphV2(id);
    const [, updateGraph] = usePutGraphsV2(id);
    const [graphData, setGraphData] = React.useState<GraphV2>();

    React.useEffect(() => {
        if (!graph.loading && graph.data) {
            setGraphData(graph.data);
        }
    }, [graph.data, id]);

    if (graphData) {
        return (
            <GraphForm
                graphData={graphData}
                update={setGraphData}
                save={async () => {
                    await updateGraph({
                        data: graphData,
                    });
                }}
            />
        );
    }
    return <LoadingPage />;
};
