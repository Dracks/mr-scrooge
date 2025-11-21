import { sub } from 'date-fns';

import { ApiUUID, Graph, Label } from '../../api/models';
import { listLabelIds } from '../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../utils/data-factory/user-group.factory';
import { generateUUID } from '../../utils/data-factory/uuid.factory';
import { BankTransactionEnriched } from '../common/transaction.context';
import { enrichGraph } from './graph-with-rechart/enrich-graph';
import { GraphBar, GraphLine, GraphPie } from './mocks/graph.mocks';
import { useGraphDataGenerator } from './use-graph-data';

vi.useFakeTimers().setSystemTime(new Date('2022-10-16'));

const getData = (): BankTransactionEnriched[] =>
    [
        { date: { days: 1 }, labelIds: [2, 4], movementName: 'first' },
        { date: { days: 2 }, labelIds: [2, 5], movementName: 'second' },
        { date: { days: 3 }, labelIds: [2, 4, 8], movementName: 'third' },
        { date: { days: 4 }, labelIds: [9], movementName: 'four' },
        { date: { days: 5 }, labelIds: [2, 8], movementName: 'five' },
        { date: { months: 10 }, labelIds: [2], movementName: 'sixt' },
        { date: { months: 4, days: 1 }, labelIds: [2], movementName: 'sixt' },
        {
            date: { days: 1 },
            labelIds: [2, 4],
            movementName: 'other group id',
            groupOwnerId: generateUUID(24, 'group'),
        },
    ].map(({ date, labelIds, ...element }, idx) => ({
        groupOwnerId: mainGroupOwnerId,
        ...element,
        date: sub(new Date(), date),
        id: generateUUID(idx, 'transaction'),
        kind: 'test',
        labelIds: labelIds.map(idx => listLabelIds[idx] as ApiUUID),
        labelsComplete: [],
        value: idx + 1,
    }));

vi.mock('../common/transaction.context', () => ({
    __esModule: true,
    useTransactionsData: vi.fn().mockImplementation(() => ({
        data: getData(),
    })),
    useThrottledTransactionsData: vi.fn().mockImplementation(() => getData()),
}));

describe('useGraphData', () => {
    let labelsList: Label[];
    beforeEach(() => {
        labelsList = [
            { id: 4, name: 'tag_4' },
            { id: 5, name: 'tag_5' },
            { id: 8, name: 'tag_8' },
        ].map(({ id, name }) => ({ id: listLabelIds[id] as ApiUUID, name, groupOwnerId: mainGroupOwnerId }));
    });
    it('Check basic pie', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphPie, id: 2 }, labelsList))).toEqual([
            {
                groupName: 'identity',
                label: 'identity',
                value: [
                    {
                        groupName: 'labels',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'labels',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'labels',
                        label: 'tag_8',
                        value: 5,
                    },
                    {
                        groupName: 'labels',
                        label: 'Others',
                        value: 13,
                    },
                ],
            },
        ]);
    });

    it('Check basic pie with hide others', () => {
        const graph: Graph = {
            ...GraphBar,
            labelFilterId: listLabelIds[2],
            group: {
                ...GraphPie.group,
                hideOthers: true,
            },
            id: generateUUID(2, 'graph'),
            order: 0,
        };
        expect(useGraphDataGenerator(enrichGraph(graph, labelsList))).toEqual([
            {
                groupName: 'month',
                label: '2022-10',
                value: [
                    {
                        groupName: 'labels',
                        label: 'tag_4',
                        value: 4,
                    },
                    {
                        groupName: 'labels',
                        label: 'tag_5',
                        value: 2,
                    },
                    {
                        groupName: 'labels',
                        label: 'tag_8',
                        value: 5,
                    },
                ],
            },
        ]);
    });

    it('Check the Graph line', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphLine, id: 2 }, labelsList))).toEqual([
            {
                groupName: 'day',
                label: '11',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 5,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '13',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 8,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '14',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 0,
                    },
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 10,
                    },
                ],
            },
            {
                groupName: 'day',
                label: '15',
                value: [
                    {
                        groupName: 'month',
                        label: '2022-06',
                        value: 7,
                    },
                    {
                        groupName: 'month',
                        label: '2022-10',
                        value: 11,
                    },
                ],
            },
        ]);
    });
});
