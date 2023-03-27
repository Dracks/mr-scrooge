import { GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind, GQLNewGraph } from '../../../api/graphql/generated';
import { graphToUi, uiToGraph } from './graph.transformer';

describe('[graph.transformer]', () => {
    const subjectDataMinimum: GQLGraph = {
        dateRange: GQLGraphDateRange.HalfYear,
        group: {
            group: GQLGraphGroup.Month,
        },
        groupOwnerId: 1,
        id: 34,
        kind: GQLGraphKind.Pie,
        name: 'minimum',
    };

    const subjectWithAllFields: GQLGraph = {
        dateRange: GQLGraphDateRange.OneYear,
        group: {
            group: GQLGraphGroup.Labels,
            hideOthers: false,
            labels: [1, 2],
        },
        groupOwnerId: 1,
        horizontalGroup: {
            group: GQLGraphGroup.Labels,
            hideOthers: true,
            labels: [3 ,  4],
        },
        id: 34,
        kind: GQLGraphKind.Line,
        name: 'max',
    };

    it('graphData with minimum transforms', () => {
        const graphUi = graphToUi(subjectDataMinimum);

        expect(graphUi.groupKind).toEqual(GQLGraphGroup.Month);

        expect(uiToGraph(graphUi)).toEqual(subjectDataMinimum);
    });

    it('graphData with all fields should match after transform', () => {
        const graphUi = graphToUi(subjectWithAllFields);
        expect(graphUi.horizontalGroupLabels).toEqual([3, 4]);
        expect(uiToGraph(graphUi)).toEqual(subjectWithAllFields);
    });
});
