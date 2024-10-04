import React from 'react';

import { GQLGraph, useGetGraphsByIdQuery, useUpdateGraphMutation } from '../../../api/graphql/generated';
import { useLogger } from '../../../utils/logger/logger.context';
import { LoadingPage } from '../../../utils/ui/loading';
import NotFound from '../../extra/not-found';
import { GraphForm } from './graph.form';

interface EditGraphProps {
    id: number;
}
export const EditGraph: React.FC<EditGraphProps> = ({ id }) => {
    const logger = useLogger();
    const [graph] = useGetGraphsByIdQuery({ variables: { graphsIds: [id] } });
    const [, updateGraph] = useUpdateGraphMutation();
    const [graphData, setGraphData] = React.useState<GQLGraph>();

    React.useEffect(() => {
        if (!graph.fetching && graph.data) {
            const { graphs } = graph.data;
            if (graphs.length === 1) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [{ __typename, ...loadedGraph }] = graphs;
                setGraphData(loadedGraph);
            } else if (graphs.length > 1) {
                logger.error('More than one graph found', { graphs });
            }
        }
    }, [graph.data, id]);

    if (graphData) {
        return (
            <GraphForm<GQLGraph>
                graphData={graphData}
                update={setGraphData}
                save={async () => {
                    await updateGraph({
                        graph: graphData,
                    });
                }}
            />
        );
    }
    if (graph.fetching) {
        return <LoadingPage />;
    }
    if (graph.data?.graphs.length === 0) {
        return <NotFound />;
    }
    return <div>Some error happened</div>;
};
