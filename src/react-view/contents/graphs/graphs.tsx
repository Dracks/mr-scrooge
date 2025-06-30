import { Grid } from 'grommet';
import React from 'react';

import { useApiClient } from '../../api/client';
import { usePagination } from '../../api/pagination';
import { useLogger } from '../../utils/logger/logger.context';
import { LoadingPage } from '../../utils/ui/loading';
import { useLabelsContext } from '../common/label.context';
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphWrapperWithRechart } from './graph-with-rechart/graph';

export const Graphs: React.FC = () => {
    const client = useApiClient();
    const logger = useLogger('Graphs');
    const graphs = usePagination(
        async next => {
            const { data } = await client.GET('/graphs', { params: { query: { cursor: next } } });
            if (data) {
                return data;
            } else {
                throw Error("Get graphs didn't had data");
            }
        },
        { autostart: true, hash: graph => graph.id },
    );
    const { labels } = useLabelsContext();

    const responseGraphList = graphs.loadedData;

    if (graphs.status == 'loading') {
        return <LoadingPage />;
    } else if (graphs.status === 'error') {
        logger.error('Error loading the graphs', graphs.error);
        return <div>Error loading the graphs </div>;
    } else {
        const enrichedGraphs = responseGraphList.map(graph => enrichGraph(graph, labels));
        enrichedGraphs.sort((a, b) => {
            return a.order - b.order;
        });
        return (
            <Grid columns={'450px'} gap="small">
                {enrichedGraphs.map(graph => (
                    <GraphWrapperWithRechart
                        key={graph.id}
                        graph={graph}
                        reload={() => {
                            graphs.reset();
                        }}
                        update={updatedGraphs => {
                            graphs.update(updatedGraphs);
                        }}
                    />
                ))}
                <AddGraphPlaceholder />
            </Grid>
        );
    }
};
