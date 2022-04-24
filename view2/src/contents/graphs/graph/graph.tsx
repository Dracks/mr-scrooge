import { Box } from 'grommet'
import React from 'react'
import { Graph } from '../../../api/client/graphs/types'
import { GraphViewer } from './view'

interface GraphWrapperArgs {
    graph: Graph
}

export const GraphWrapper : React.FC<GraphWrapperArgs> = ({graph}) => {
    return <Box direction='column'>
        <GraphViewer graph={graph}/>
    </Box>
}