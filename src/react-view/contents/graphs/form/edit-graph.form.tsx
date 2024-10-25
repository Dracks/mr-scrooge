import React from 'react';
import { useAsync, useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../../api/client';
import { ApiUUID, Graph, GraphParam } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { LoadingPage } from '../../../utils/ui/loading';
import NotFound from '../../extra/not-found';
import { GraphForm } from './graph.form';

interface EditGraphProps {
    id: ApiUUID;
}
export const EditGraph: React.FC<EditGraphProps> = ({ id }) => {
    const logger = useLogger("EditGraph");
    const client = useApi();
    const graphQuery = useAsync(()=>client.GET("/graphs", {params: {query: {graphIds: [id]}}}), [id, client]);
    const updateGraph = useAsyncCallback((id: ApiUUID, graph: GraphParam)=>{
        return client.PUT("/graphs/{id}", {
            params: { path: { id }, },
            body: graph
        })
    })

   const [graphData, setGraphData] = React.useState<Graph>();

    React.useEffect(() => {
        if (graphQuery.status == "success" ) {
            const { results: graphs } = graphQuery.result?.data ?? {results: []};
            if (graphs.length === 1) {
                setGraphData(graphs[0]);
            } else if (graphs.length > 1) {
                logger.error('More than one graph found', { graphs });
            } else {
                setGraphData(undefined)
            }
        }
    }, [graphQuery.status, id]);


    if (graphQuery.status === "loading") {
        return <LoadingPage />;
    } else if (graphData) {
        return (
            <GraphForm<Graph>
                graphData={graphData}
                update={setGraphData}
                save={() => {
                    updateGraph.execute(id, graphData).catch((error: unknown) => { logger.error("Saving the graph", { error }) });
                }}
            />
        );
    } else if (graphQuery.status === "error") {
        logger.error("Error getting the graph", graphQuery.result?.error)
        return <div> Error getting the graph </div>
    } else {
        return <NotFound />;

    }
};
