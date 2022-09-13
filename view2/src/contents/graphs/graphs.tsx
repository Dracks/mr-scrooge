import React from 'react'
import { Box, DataChart, Text } from "grommet"
import { useGetGraphs } from "../../api/client/graphs/use-get-graphs"
import { useJoinedGraphs } from "../../api/client/graphs/use-joined-graphs"
import { LoadingPage } from "../../utils/ui/loading"
import { GraphWrapper } from "./graph/graph"
import { useGetGraphsV2 } from '../../api/client/graphs/use-get-graphs-v2'
import { enrichGraph} from './graph/enrich-graph'
import { useTagsContext } from '../common/tag.context'

export const Graphs: React.FC = ()=>{
    const  [graphsResponse] = useGetGraphs()
    const [ graphsV2Response ] = useGetGraphsV2()
    const {tags} = useTagsContext()
    const joinedGraphsResponse = useJoinedGraphs(graphsV2Response, graphsResponse);
    if (joinedGraphsResponse.loading){
        return <LoadingPage />
    } else if (joinedGraphsResponse.data){
        return <Box direction='row'>
            {joinedGraphsResponse.data.map((graph, idx)=><GraphWrapper key={idx} graph={enrichGraph(graph, tags)} />)}
        </Box>
    }
    return <div>Daleks</div>
}