import React from 'react'
import { ResponsiveBar, Bar, BarDatum} from '@nivo/bar'
import { ResponsiveLine, Line, Serie } from '@nivo/line'
import { ColorSchemeId } from '@nivo/colors'
import { Box, Heading } from "grommet"
import { EnrichedGraph, GraphKind, GraphV2 } from "../../../api/client/graphs/types"
import { useGraphDataGenerator } from '../use-graph-data'
import { DSDoubleGroup } from '../data-transform/types'

interface GraphRenderArgs {
    graphData: DSDoubleGroup<string, string>[]
}

interface GraphViewerArgs {
    graph: EnrichedGraph
}


const GenericToBarChart =<K extends string, SK extends string>(inputData: DSDoubleGroup<K, SK>[]): { keys: SK[], firstKey: string, data: Array<Record<string, number>> } => {
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

const GenericToLineChart =  <K extends string, SK extends string>(inputData: DSDoubleGroup<K, SK>[]): Serie[] => {
    const groupMap : Record<string, Array<{x: string, y: number}>> = {}
    inputData.forEach(group => {
        group.value.forEach(({label, value}) => {
            const serie : Array<{x: string, y: number}> = groupMap[label] ?? []
            groupMap[label] = serie
            serie.push({x: group.label, y: value})
        })
    })
    return Object.keys(groupMap).map(key => {
        const data = groupMap[key]
        return {
            id: key,
            data,
        }
    })
}

const commonProps = {
    width: 500,
    height: 500,
    // margin: { top: 60, right: 110, bottom: 60, left: 80 },
    margin: { top: 20, right: 20, bottom: 60, left: 80 },
    padding: 0.2,
    labelTextColor: 'inherit:darker(1.4)',
    labelSkipWidth: 16,
    labelSkipHeight: 16,
    colors:{ scheme: 'category10' as ColorSchemeId }
}

const BarGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {

    const { keys, firstKey, data } = GenericToBarChart<string, string>(graphData)
    const data2 : BarDatum[] = data
    return <Bar 
        {...commonProps} 
        groupMode="grouped" 
        indexBy={firstKey}
        keys={keys}
        data={data2}
        />
}

const LineGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const data = GenericToLineChart(graphData)

    return <Line
            {...commonProps}
            data={data}
            isInteractive
            enableSlices= 'x'
            />
       
}

const ComponentHash: Record<GraphKind, React.FC<GraphRenderArgs>> = {
    'line': LineGraphRender,
    'bar': BarGraphRender,
    'pie': ({ graphData }) => <Box direction='column' >pie</Box>,
}

export const GraphViewer: React.FC<GraphViewerArgs> = ({ graph }) => {
    const data = useGraphDataGenerator(graph)
    const Component = ComponentHash[graph.kind]
    return <Box direction='column' height={"medium"}>
        <Heading level={3}>
            {graph.name}
        </Heading>
        <Component graphData={data} />
    </Box>
}