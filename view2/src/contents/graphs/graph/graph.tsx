import { Box } from 'grommet'
import React from 'react'
import { GraphV2 } from '../../../api/client/graphs/types'
import { GraphViewer } from './view'

interface GraphWrapperArgs {
    graph: GraphV2
}

export const GraphWrapper : React.FC<GraphWrapperArgs> = ({graph}) => {
    return <Box direction='column'>
        <GraphViewer graph={graph}/>
    </Box>
}