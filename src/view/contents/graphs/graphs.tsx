import { Grid } from 'grommet';
import React from 'react';

import { useGetGraphs } from '../../api/client/graphs/use-get-graphs';
import { useGetGraphsV2 } from '../../api/client/graphs/use-get-graphs-v2';
import { useJoinedGraphs } from '../../api/client/graphs/use-joined-graphs';
import { usePostGraphsV2 } from '../../api/client/graphs/use-post-graphs-v2';
import { useGetGraphsQuery } from '../../api/graphql/generated';
import { useLogger } from '../../utils/logger/logger.context';
import { LoadingPage } from '../../utils/ui/loading';
import { useLabelsContext } from '../common/label.context';
import { useTagsContext } from '../common/tag.context';
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphWrapperWithRechart } from './graph-with-rechart/graph';

export const Graphs: React.FC = () => {
    const logger = useLogger();

    const [ graphs, refresh ] = useGetGraphsQuery()
    const { labels } = useLabelsContext();

    const responseGraphList = graphs.data?.graphs;

    if (graphs.fetching) {
        return <LoadingPage />;
    } else if (responseGraphList) {
        const graphs = responseGraphList.map(graph => enrichGraph(graph, labels));
        return (
            <Grid columns={'450px'} gap="small">
                {graphs.map((graph, idx) => (
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
