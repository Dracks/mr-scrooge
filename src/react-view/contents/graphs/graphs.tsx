import { Grid } from 'grommet';
import React from 'react';

import { useApi } from '../../api/client';
import { usePagination } from '../../api/pagination';
import { useLogger } from '../../utils/logger/logger.context';
import { LoadingPage } from '../../utils/ui/loading';
import { useLabelsContext } from '../common/label.context';
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphWrapperWithRechart } from './graph-with-rechart/graph';

export const Graphs: React.FC = () => {
    const client = useApi()
    const logger = useLogger()
    const graphs = usePagination(async next => {
        const { data } = await client.GET("/graphs", {params: {query: {cursor: next}}})
        if (data){
            return data
        } else {
            throw Error("Get graphs didn't had data")
        }
    });
    const { labels } = useLabelsContext();

    const responseGraphList = graphs.loadedData;

    if (graphs.status == "loading") {
        return <LoadingPage />;
    } else if (graphs.status === "error"){
        logger.error("Error loading the graphs", graphs.error)
        return <div>Error loading the graphs </div>
    } else  {
        const enrichedGraphs = responseGraphList.map(graph => enrichGraph(graph, labels));
        return (
            <Grid columns={'450px'} gap="small">
                {enrichedGraphs.map((graph, idx) => (
                    <GraphWrapperWithRechart
                        key={idx}
                        graph={graph}
                        reload={() => {
                            graphs.reset();
                        }}
                    />
                ))}
                <AddGraphPlaceholder />
            </Grid>
        );
    }
};