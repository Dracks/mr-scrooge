import { Box } from 'grommet'
import React from 'react'
import { EnrichedGraph, GraphV2 } from '../../../api/client/graphs/types'
import { GraphViewer } from './view'

interface GraphWrapperArgs {
    graph: EnrichedGraph
}

export const GraphWrapperWithRechart : React.FC<GraphWrapperArgs> = ({graph}) => {
    return <Box direction='column'>
        <GraphViewer graph={graph}/>
    </Box>
}