import React from 'react'
import { Box, DataChart, Heading } from "grommet"
import { EnrichedGraph, GraphKind, GraphV2 } from "../../../api/client/graphs/types"
import { useGraphDataGenerator } from '../use-graph-data'
import { DSDoubleGroup } from '../data-transform/types'
import { useLogger } from '../../../utils/logger/logger.context'
import { Logger } from '../../../utils/logger/logger.class'

interface GraphRenderArgs {
    graphData: DSDoubleGroup<string, string>[]
}

interface GraphViewerArgs {
    graph: EnrichedGraph
}


const GenericToGrommetChart = <K extends string, SK extends string>(inputData: DSDoubleGroup<K, SK>[]): { keys: SK[], firstKey: string, data: Array<Record<string, number>> } => {
    const keys: Set<SK> = new Set()
    const [first] = inputData
    const data = inputData.map(group => ({
        [group.groupName]: group.label,
        ...group.value.reduce((acc, cur) => {
            keys.add(cur.label)
            return { ...acc, [cur.label]: cur.value }
        }, {} as Record<SK, number>)
    }))
    return { keys: Array.from(keys), firstKey: first?.groupName ?? 'unknown', data }
}

const GraphSize = {width: 'fill', height: 'medium'}

const BarGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const { keys, firstKey, data } = GenericToGrommetChart<string, string>(graphData)
    return <Box direction='column'>
        <DataChart
            data={data}
            series={[firstKey, ...keys]}
            size={GraphSize}
            detail
            legend
            offset={{ gap: 'xxsmall' }}
            chart={keys.map(property => ({
                property,
                type: 'bar',
                thickness: 'small',
            }))}
            axis={{ x: { property: 'date', granularity: 'medium' } }}
        /></Box>
}

const LineGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const logger = useLogger()
    logger.info('Line Graph Render', {graphData})
    const { keys, firstKey, data } = GenericToGrommetChart<string, string>(graphData)
    return <Box direction='column'>
        <DataChart
            data={data}
            series={[firstKey, ...keys]}
            size={GraphSize}
            detail
            legend
            offset={{ gap: 'xxsmall' }}
            chart={keys.map(property => ({
                property,
                type: 'line',
                thickness: 'xsmall',
            }))}
            axis={{ x: { property: 'date', granularity: 'medium' } }}
        /></Box>
}

const ComponentHash: Record<GraphKind, React.FC<GraphRenderArgs>> = {
    'line': LineGraphRender,
    'bar': BarGraphRender,
    'pie': ({ graphData }) => <Box direction='column' >pie</Box>,
}

export const GraphViewer: React.FC<GraphViewerArgs> = ({ graph }) => {
    const logger = useLogger()
    const data = useGraphDataGenerator(graph)
    logger.info(graph.name, {data})
    const Component = ComponentHash[graph.kind]
    return <Box direction='column'>
        <Heading level={3}>
            {graph.name}
        </Heading>
        <Component graphData={data} />
    </Box>
}