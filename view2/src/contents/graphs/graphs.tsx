import React from 'react'
import { Box } from "grommet"
import { useGetGraphs } from "../../api/client/graphs/use-get-graphs"
import { graphV1V2Mapper } from "../../api/client/graphs/graph-v1-v2.mapper"
import { LoadingPage } from "../../utils/ui/loading"
import { GraphWrapper } from "./graph/graph"
import { GraphV2 } from '../../api/client/graphs/types'

export const Graphs: React.FC = ()=>{
    const  [graphsResponse] = useGetGraphs()
    if (graphsResponse.loading){
        return <LoadingPage />
    } else if (graphsResponse.data){
        return <Box direction='row'>
            {graphsResponse.data.map((graph, idx)=><GraphWrapper key={idx} graph={graphV1V2Mapper(graph) as GraphV2} />)}
        </Box>
    }
    return <div>Daleks</div>
}