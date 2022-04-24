import React from 'react'
import { Box } from "grommet"
import { useGetGraphs } from "../../api/client/graphs/use-get-graphs"
import { LoadingPage } from "../../utils/ui/loading"
import { GraphWrapper } from "./graph/graph"

export const Graphs: React.FC = ()=>{
    const  [graphsResponse] = useGetGraphs()
    console.log("DALEKS!")
    if (graphsResponse.loading){
        return <LoadingPage />
    } else if (graphsResponse.data){
        return <Box direction='row'>
            {graphsResponse.data.map((graph, idx)=><GraphWrapper key={idx} graph={graph} />)}
        </Box>
    }
    return <div>Daleks</div>
}