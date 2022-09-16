import React from 'react'
import { Box, DataChart, Grid, ResponsiveContext, Tab, Tabs, Text } from "grommet"
import { useGetGraphs } from "../../api/client/graphs/use-get-graphs"
import { useJoinedGraphs } from "../../api/client/graphs/use-joined-graphs"
import { LoadingPage } from "../../utils/ui/loading"
import { useGetGraphsV2 } from '../../api/client/graphs/use-get-graphs-v2'
import { enrichGraph } from './graph-with-nivo/enrich-graph'

import { useTagsContext } from '../common/tag.context'
import { GraphWrapperWithNivo } from './graph-with-nivo/graph'
import { useLogger } from '../../utils/logger/logger.context'
import { GraphWrapper } from './graph-with-grommet/graph'
import { EnrichedGraph } from '../../api/client/graphs/types'
import { GraphWrapperWithRechart } from './graph-with-rechart/graph'
import { AddGraphPlaceholder } from './graph-with-rechart/add-graph-placeholder'
import { usePostGraphsV2 } from '../../api/client/graphs/use-post-graphs-v2'

export const GraphTester: React.FC<{ graphs: EnrichedGraph[] }> = ({ graphs }) => {
    const [index, setIndex] = React.useState(2);
    const onActive = (nextIndex: number) => setIndex(nextIndex);
    return <Tabs activeIndex={index} onActive={onActive} justify="start">
        <Tab title='Grommet'>
            <Grid columns={'450px'} gap="small">
                {graphs.map((graph, idx) => <GraphWrapper key={idx} graph={graph} />)}
                {graphs.map((graph, idx) => <GraphWrapper key={idx} graph={graph} />)}
            </Grid>
        </Tab>
        <Tab title='Nivo'>
            <Grid columns={'450px'} gap="small">
                {graphs.map((graph, idx) => <GraphWrapperWithNivo key={idx} graph={graph} />)}
                {graphs.map((graph, idx) => <GraphWrapperWithNivo key={idx} graph={graph} />)}
            </Grid>
        </Tab>
        <Tab title='Rechart'>
            <Grid columns={'450px'} gap="small">
                {graphs.map((graph, idx) => <GraphWrapperWithRechart key={idx} graph={graph} />)}
                {graphs.map((graph, idx) => <GraphWrapperWithRechart key={idx} graph={graph} />)}
            </Grid>
        </Tab>

    </Tabs>
}

export const Graphs: React.FC = () => {
    const logger = useLogger()
    const [graphsResponse] = useGetGraphs()
    const [graphsV2Response, refresh] = useGetGraphsV2()
    const [, createNewGraphs] = usePostGraphsV2()
    const { tags } = useTagsContext()
    const joinedGraphsResponse = useJoinedGraphs(graphsV2Response, graphsResponse);
    const responseGraphList = joinedGraphsResponse.data
    const oldGraphs = responseGraphList?.filter(graph => !graph.id && graph.oldGraph)
    React.useEffect(()=>{
        if (oldGraphs && oldGraphs.length>0){
            (async ()=>{
                for await (const graph of oldGraphs){
                    const response = await createNewGraphs({data: graph})
                    logger.info(`Update graph ${graph.name}`, {response})
                }
                    
                await refresh()
            })()
        }
    }, [oldGraphs ? true : false])
    if (joinedGraphsResponse.loading) {
        return <LoadingPage />
    } else if (responseGraphList) {
        const graphs = responseGraphList.map(graph => enrichGraph(graph, tags))
        return <Grid columns={'450px'} gap="small">
            {graphs.map((graph, idx) => <GraphWrapperWithRechart key={idx} graph={graph} />)}
            {graphs.map((graph, idx) => <GraphWrapperWithRechart key={idx} graph={graph} />)}
            <AddGraphPlaceholder />
        </Grid>
    }
    return <div>Daleks</div>
}