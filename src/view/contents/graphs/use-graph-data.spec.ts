import { sub } from 'date-fns';

import { GraphV2Bar, GraphV2Line, GraphV2Pie } from '../../api/client/graphs/mocks/graph-v2.mocks';
import { GQLGraph, GQLLabel } from '../../api/graphql/generated';
import { listLabelIds } from '../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../utils/data-factory/user-group.factory';
import { generateUUID } from '../../utils/data-factory/uuid.factory';
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
        { date: { days: 1 }, labelIds: [2, 4], movementName: 'other group id', groupOwnerId: generateUUID(24, "group") },
    ].map(({ date, labelIds, ...element }, idx) => ({
        groupOwnerId: mainGroupOwnerId,
        ...element,
        date: sub(new Date(), date),
        id: generateUUID(idx, "transaction"),
        kind: 'test',
        labelIds: labelIds.map(idx => listLabelIds[idx]),
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
        ].map(({id, name}) => ({ id: listLabelIds[id], name, groupOwnerId: mainGroupOwnerId }));
    });
    it('Check basic pie', () => {
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Pie, id: 2 }, labelsList))).toEqual([
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
        const graph: GQLGraph = {
            ...GraphV2Bar,
            labelFilterId: listLabelIds[2],
            group: {
                ...GraphV2Pie.group,
                hideOthers: true,
            },
            id: generateUUID(2, "graph"),
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
        expect(useGraphDataGenerator(enrichGraph({ ...GraphV2Line, id: 2 }, labelsList))).toEqual([
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
