import React from 'react'
import { Box, Heading } from "grommet"
import { GraphV2 } from "../../../api/client/graphs/types"


interface GraphViewerArgs{
    graph: GraphV2
}

export const GraphViewer : React.FC<GraphViewerArgs>= ({graph})=>{
    console.log(graph)
    return <Box direction='column'>
        <Heading level={3}>
            {graph.name}
        </Heading>
    </Box>
}