import { sub } from 'date-fns';

import { GraphV2Bar, GraphV2Line, GraphV2Pie } from '../../api/client/graphs/mocks/graph-v2.mocks';
import { GraphV2 } from '../../api/client/graphs/types';
import { Tag } from '../../api/client/tag/types';
import { RdsEnriched } from '../common/raw-data-source.context';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { useGraphDataGenerator } from './use-graph-data';

jest.useFakeTimers().setSystemTime(new Date('2022-10-16'));

const getData = (): RdsEnriched[] =>
    [
        { date: { days: 1 }, tags: [2, 4], movementName: 'first' },
        { date: { days: 2 }, tags: [2, 5], movementName: 'second' },
        { date: { days: 3 }, tags: [2, 4, 8], movementName: 'third' },
        { date: { days: 4 }, tags: [9], movementName: 'four' },
        { date: { days: 5 }, tags: [2, 8], movementName: 'five' },
        { date: { months: 10 }, tags: [2], movementName: 'sixt' },
        { date: { months: 4, days: 1 }, tags: [2], movementName: 'sixt' },
    ].map(({ date, ...element }, idx) => ({
        ...element,
        date: sub(new Date(), date),
        id: idx,
        kind: 'test',
        tagsComplete: [],
        value: idx + 1,
    }));

jest.mock('../common/raw-data-source.context', () => ({
    __esModule: true,
    useRdsData: jest.fn().mockImplementation(() => ({
        data: getData(),
    })),
}));

describe('useGraphData', () => {
    let tags: Tag[];
    beforeEach(() => {
        tags = [
            { id: 4, name: 'tag_4' },
            { id: 5, name: 'tag_5' },
            { id: 8, name: 'tag_8' },
        ].map(element => ({ ...element, children: [], filters: [] }));
    });
    it('Check basic pie', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Pie, id: 2 }, tags))).toEqual([
            {
                groupName: 'identity',
                label: 'identity',
                value: [
                    {
                        groupName: 'tags',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'tags',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'tags',
                        label: 'tag_8',
                        value: 5,
                    },
                    {
                        groupName: 'tags',
                        label: 'Others',
                        value: 13,
                    },
                ],
            },
        ]);
    });

    it('Check basic pie with hide others', () => {
        const graph: GraphV2 = {
            ...GraphV2Bar,
            tagFilter: 2,
            group: {
                ...GraphV2Pie.group,
                hideOthers: true,
            },
            id: 2,
        };
        expect(useGraphDataGenerator(enrichGraph(graph, tags))).toEqual([
            {
                groupName: 'month',
                label: '2022-10',
                value: [
                    {
                        groupName: 'tags',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'tags',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'tags',
                        label: 'tag_8',
                        value: 5,
                    },
                ],
            },
        ]);
    });

    it('Check the Graph line', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Line, id: 2 }, tags))).toEqual([
            {
                groupName: 'day',
                label: '11',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 5,
                    },
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '13',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 8,
                    },
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '14',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 10,
                    },
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '15',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 11,
                    },
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 7,
                    },
                ],
            },
        ]);
    });
});
