import { sub } from 'date-fns';

import { GraphV2Bar, GraphV2Line, GraphV2Pie } from '../../api/client/graphs/mocks/graph-v2.mocks';
import { GQLGraph, GQLLabel } from '../../api/graphql/generated';
import { TransactionsEnriched } from '../common/raw-data-source.context';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { useGraphDataGenerator } from './use-graph-data';

jest.useFakeTimers().setSystemTime(new Date('2022-10-16'));

const getData = (): TransactionsEnriched[] =>
    [
        { date: { days: 1 }, labelIds: [2, 4], movementName: 'first' },
        { date: { days: 2 }, labelIds: [2, 5], movementName: 'second' },
        { date: { days: 3 }, labelIds: [2, 4, 8], movementName: 'third' },
        { date: { days: 4 }, labelIds: [9], movementName: 'four' },
        { date: { days: 5 }, labelIds: [2, 8], movementName: 'five' },
        { date: { months: 10 }, labelIds: [2], movementName: 'sixt' },
        { date: { months: 4, days: 1 }, labelIds: [2], movementName: 'sixt' },
        { date: { days: 1 }, labelIds: [2, 4], movementName: 'other group id', groupOwnerId: 24 },
    ].map(({ date, ...element }, idx) => ({
        groupOwnerId: 1,
        ...element,
        date: sub(new Date(), date),
        id: idx,
        kind: 'test',
        labelsComplete: [],
        value: idx + 1,
    }));

jest.mock('../common/raw-data-source.context', () => ({
    __esModule: true,
    useRdsData: jest.fn().mockImplementation(() => ({
        data: getData(),
    })),
}));

describe('useGraphData', () => {
    let labelsList: GQLLabel[];
    beforeEach(() => {
        labelsList = [
            { id: 4, name: 'tag_4' },
            { id: 5, name: 'tag_5' },
            { id: 8, name: 'tag_8' },
        ].map(element => ({ ...element, groupOwnerId: 1 }));

    });
    it('Check basic pie', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Pie, id: 2 }, labelsList))).toEqual([
            {
                groupName: 'identity',
                label: 'identity',
                value: [
                    {
                        groupName: 'Labels',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'Labels',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'Labels',
                        label: 'tag_8',
                        value: 5,
                    },
                    {
                        groupName: 'Labels',
                        label: 'Others',
                        value: 13,
                    },
                ],
            },
        ]);
    });

    it('Check basic pie with hide others', () => {
        const graph: GQLGraph = {
            ...GraphV2Bar,
            labelFilter: 2,
            group: {
                ...GraphV2Pie.group,
                hideOthers: true,
            },
            id: 2,
        };
        expect(useGraphDataGenerator(enrichGraph(graph, labelsList))).toEqual([
            {
                groupName: 'Month',
                label: '2022-10',
                value: [
                    {
                        groupName: 'Labels',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'Labels',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'Labels',
                        label: 'tag_8',
                        value: 5,
                    },
                ],
            },
        ]);
    });

    it('Check the Graph line', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Line, id: 2 }, labelsList))).toEqual([
            {
                groupName: 'Day',
                label: '11',
                value: [
                    {
                        groupName: 'Month',
                        label: '2022-10',
                        value: 5,
                    },
                    {
                        groupName: 'Month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'Day',
                label: '13',
                value: [
                    {
                        groupName: 'Month',
                        label: '2022-10',
                        value: 8,
                    },
                    {
                        groupName: 'Month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'Day',
                label: '14',
                value: [
                    {
                        groupName: 'Month',
                        label: '2022-10',
                        value: 10,
                    },
                    {
                        groupName: 'Month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'Day',
                label: '15',
                value: [
                    {
                        groupName: 'Month',
                        label: '2022-10',
                        value: 11,
                    },
                    {
                        groupName: 'Month',
                        label: '2022-06',
                        value: 7,
                    },
                ],
            },
        ]);
    });
});
