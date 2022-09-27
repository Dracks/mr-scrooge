import { Grid } from 'grommet';
import React from 'react';

import { useGetGraphs } from '../../api/client/graphs/use-get-graphs';
import { useGetGraphsV2 } from '../../api/client/graphs/use-get-graphs-v2';
import { useJoinedGraphs } from '../../api/client/graphs/use-joined-graphs';
import { usePostGraphsV2 } from '../../api/client/graphs/use-post-graphs-v2';
import { useLogger } from '../../utils/logger/logger.context';
import { LoadingPage } from '../../utils/ui/loading';
import { useTagsContext } from '../common/tag.context';
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphWrapperWithRechart } from './graph-with-rechart/graph';

export const Graphs: React.FC = () => {
    const logger = useLogger();
    const [graphsResponse] = useGetGraphs();
    const [graphsV2Response, refresh] = useGetGraphsV2();
    const [, createNewGraphs] = usePostGraphsV2();
    const { tags } = useTagsContext();
    const joinedGraphsResponse = useJoinedGraphs(graphsV2Response, graphsResponse);
    const responseGraphList = joinedGraphsResponse.data;
    const oldGraphs = responseGraphList?.filter(graph => !graph.id && graph.oldGraph);
    React.useEffect(() => {
        if (oldGraphs && oldGraphs.length > 0) {
            (async () => {
                for await (const graph of oldGraphs) {
                    const response = await createNewGraphs({ data: graph });
                    logger.info(`Update graph ${graph.name}`, { response });
                }

                await refresh();
            })();
        }
    }, [Boolean(oldGraphs)]);
    if (joinedGraphsResponse.loading) {
        return <LoadingPage />;
    } else if (responseGraphList) {
        const graphs = responseGraphList.map(graph => enrichGraph(graph, tags));
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
