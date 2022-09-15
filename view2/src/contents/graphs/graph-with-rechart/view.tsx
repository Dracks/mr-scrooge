import React from 'react'
import { Box, DataChart, Heading } from "grommet"
import { EnrichedGraph, GraphKind, GraphV2 } from "../../../api/client/graphs/types"
import { useGraphDataGenerator } from '../use-graph-data'
import { DSDoubleGroup } from '../data-transform/types'
import { useLogger } from '../../../utils/logger/logger.context'
import { Logger } from '../../../utils/logger/logger.class'
import {schemeTableau10} from 'd3-scale-chromatic';
import {ResponsiveContainer, LineChart, Line, CartesianGrid, Bar, XAxis,YAxis, Tooltip, Legend, BarChart} from 'recharts'

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

const BarGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const { keys, firstKey, data } = GenericToGrommetChart<string, string>(graphData)
    return <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey={firstKey} />
    <YAxis />
    <Tooltip />
    <Legend />
    {keys.map((key, idx)=><Bar type="monotone" dataKey={key} key={key} fill={schemeTableau10[idx]} />)}
</BarChart>
</ResponsiveContainer>
}

const LineGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const logger = useLogger()
    const { keys, firstKey, data } = GenericToGrommetChart<string, string>(graphData)
    logger.info('Line Graph Render', {graphData, keys, firstKey, data})
    return <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={firstKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, idx)=><Line type="monotone" dataKey={key} key={key} stroke={schemeTableau10[idx]} />)}
        </LineChart>
    </ResponsiveContainer>
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