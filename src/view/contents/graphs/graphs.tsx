import { Grid } from 'grommet';
import React from 'react';

import { useGetGraphsQuery } from '../../api/graphql/generated';
import { LoadingPage } from '../../utils/ui/loading';
import { useLabelsContext } from '../common/label.context';
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphWrapperWithRechart } from './graph-with-rechart/graph';

export const Graphs: React.FC = () => {
    const [graphs, refresh] = useGetGraphsQuery();
    const { labels } = useLabelsContext();

    const responseGraphList = graphs.data?.graphs;

    if (graphs.fetching) {
        return <LoadingPage />;
    } else if (responseGraphList) {
        const enrichedGraphs = responseGraphList.map(graph => enrichGraph(graph, labels));
        return (
            <Grid columns={'450px'} gap="small">
                {enrichedGraphs.map((graph, idx) => (
                    <GraphWrapperWithRechart
                        key={idx}
                        graph={graph}
                        reload={async () => {
                            await refresh();
                        }}
                    />
                ))}
                <AddGraphPlaceholder />
            </Grid>
        );
    }
    return <div>Daleks</div>;
};
