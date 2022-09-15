import { Box } from 'grommet'
import React from 'react'
import { EnrichedGraph, GraphV2 } from '../../../api/client/graphs/types'
import { GraphViewer } from './view'

interface GraphWrapperArgs {
    graph: EnrichedGraph
}

export const GraphWrapperWithNivo : React.FC<GraphWrapperArgs> = ({graph}) => {
    return <Box direction='column' width={{min:'large', width: 'fill'}}>
        <GraphViewer graph={graph}/>
    </Box>
}