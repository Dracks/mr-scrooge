import { schemeTableau10 } from 'd3-scale-chromatic';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { ApiUUID, GraphInput,GraphKind } from '../../../api/models';
import { DECIMAL_COUNT } from '../../../constants';
import { useLogger } from '../../../utils/logger/logger.context';
import { DSDoubleGroup } from '../data-transform/types';
import { EnrichedGraph } from '../types';
import { useGraphDataGenerator } from '../use-graph-data';

interface GraphRenderArgs {
    graphData: DSDoubleGroup<string, string>[];
}

interface GraphViewerArgs {
    graph: EnrichedGraph<GraphInput>;
}

const genericToRecharts = <K extends string, SK extends string>(
    inputData: DSDoubleGroup<K, SK>[],
): { data: Record<string, ApiUUID>[]; firstKey: string; keys: SK[] } => {
    const keys: Set<SK> = new Set();
    const [first] = inputData;
    const data = inputData.map(group => ({
        [group.groupName]: group.label,
        ...group.value.reduce<Partial<Record<SK, ApiUUID>>>((acc, cur) => {
            keys.add(cur.label);
            return { ...acc, [cur.label]: cur.value };
        }, {}),
    }));
    return {
        keys: Array.from(keys),
        firstKey: first?.groupName ?? 'unknown',
        data,
    };
};

const useHideLogic: () => [string[], (d: string) => void] = () => {
    const [hidenElements, setHidenElements] = React.useState<string[]>([]);
    const touch = (dataKey: string) => {
        if (hidenElements.includes(dataKey)) {
            setHidenElements(hidenElements.filter(key => key !== dataKey));
        } else {
            setHidenElements([...hidenElements, dataKey]);
        }
    };
    return [hidenElements, touch];
};

const BarGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const { keys, firstKey, data } = genericToRecharts<string, string>(graphData);
    const [hidenElements, touch] = useHideLogic();
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={firstKey} />
                <YAxis />
                <Tooltip formatter={value => (value as number).toFixed(DECIMAL_COUNT)} />
                <Legend
                    onClick={({ dataKey }) => {
                        touch(dataKey as string);
                    }}
                />
                {keys.map((key, idx) => (
                    <Bar
                        type="monotone"
                        dataKey={key}
                        key={key}
                        fill={schemeTableau10[idx]}
                        hide={hidenElements.includes(key)}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

const LineGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const logger = useLogger('LineGraphRender');
    const { keys, firstKey, data } = genericToRecharts<string, string>(graphData);
    const [hidenElements, touch] = useHideLogic();

    logger.info('Line Graph Render', { graphData, keys, firstKey, data });
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={firstKey} />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(DECIMAL_COUNT)} />
                <Legend
                    onClick={({ dataKey }) => {
                        touch(dataKey as string);
                    }}
                />
                {keys.map((key, idx) => (
                    <Line
                        type="monotone"
                        dataKey={key}
                        key={key}
                        stroke={schemeTableau10[idx]}
                        hide={hidenElements.includes(key)}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

const PieGraphRender: React.FC<GraphRenderArgs> = ({ graphData }) => {
    const logger = useLogger();

    logger.info('Pie Graph Render', { graphData });
    const [firstGroup] = graphData;
    const keys = firstGroup?.value.map(pair => pair.label) ?? [];

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Legend />
                <Tooltip formatter={value => (value as number).toFixed(DECIMAL_COUNT)} />
                <Pie
                    data={firstGroup?.value}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    label={({ value }: { value: number }) => value.toFixed(DECIMAL_COUNT)}
                >
                    {keys.map((_, index) => (
                        <Cell key={`cell-${String(index)}`} fill={schemeTableau10[index]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

const ComponentHash: Record<GraphKind, React.FC<GraphRenderArgs>> = {
    line: LineGraphRender,
    bar: BarGraphRender,
    pie: PieGraphRender,
};

export const GraphViewer: React.FC<GraphViewerArgs> = ({ graph }) => {
    const logger = useLogger();
    const data = useGraphDataGenerator(graph);
    logger.info(`graph viewer: ${graph.name}`, { data });
    const Component = ComponentHash[graph.kind];
    return <Component graphData={data} />;
};
