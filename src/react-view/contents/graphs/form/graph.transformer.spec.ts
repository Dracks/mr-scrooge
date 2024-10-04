import { GQLGraph, GQLGraphDateRange, GQLGraphGroup, GQLGraphKind, GQLNewGraph } from '../../../api/graphql/generated';
import { listLabelIds } from '../../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../../utils/data-factory/user-group.factory';
import { generateUUID } from '../../../utils/data-factory/uuid.factory';
import { graphToUi, uiToGraph } from './graph.transformer';

describe('[graph.transformer]', () => {
    const subjectDataMinimum: GQLGraph = {
        dateRange: GQLGraphDateRange.Six,
        group: {
            group: GQLGraphGroup.Month,
        },
        groupOwnerId: mainGroupOwnerId,
        id: generateUUID(34, 'graph'),
        kind: GQLGraphKind.Pie,
        name: 'minimum',
    };

    const subjectWithAllFields: GQLGraph = {
        dateRange: GQLGraphDateRange.Year,
        group: {
            group: GQLGraphGroup.Labels,
            hideOthers: false,
            labels: [1, 2].map(idx => listLabelIds[idx]),
        },
        groupOwnerId: mainGroupOwnerId,
        horizontalGroup: {
            group: GQLGraphGroup.Labels,
            hideOthers: true,
            labels: [3, 4].map(idx => listLabelIds[idx]),
        },
        id: generateUUID(34, 'graph'),
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
        expect(graphUi.horizontalGroupLabels).toEqual([3, 4].map(idx => listLabelIds[idx]));
        expect(uiToGraph(graphUi)).toEqual(subjectWithAllFields);
    });
});
