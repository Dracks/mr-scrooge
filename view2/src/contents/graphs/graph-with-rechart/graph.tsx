import { Box, Button, Heading } from 'grommet'
import { Edit, Trash } from 'grommet-icons'
import React from 'react'
import { useNavigate } from 'react-router'
import { EnrichedGraph } from '../../../api/client/graphs/types'
import { ConfirmationButton } from '../../../utils/ui/confirmation-button'
import { GraphViewer } from './view'

interface GraphWrapperArgs {
    graph: EnrichedGraph
}

export const GraphWrapperWithRechart : React.FC<GraphWrapperArgs> = ({graph}) => {
    const navigate = useNavigate()
    return <Box direction='column'>
        <Heading level={3}>
            {graph.name}
        </Heading>
        <GraphViewer graph={graph}/>
        <Box direction='row' justify='center'>
            <Button 
                icon={<Edit />}
                onClick={()=>navigate(`graph/${graph.id}`)}
             />
            <ConfirmationButton color="accent-4" icon={<Trash />} onConfirm={ () => {
                throw new Error('Function not implemented.')
            } } />
        </Box>
    </Box>
}