import { ApiUUID, Graph } from '../../../api/models';
import { listLabelIds } from '../../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../../utils/data-factory/user-group.factory';
import { generateUUID } from '../../../utils/data-factory/uuid.factory';
import { graphToUi, uiToGraph } from './graph.transformer';

describe('[graph.transformer]', () => {
    const subjectDataMinimum: Graph = {
        dateRange: 'sixYears',
        group: {
            group: 'month',
        },
        groupOwnerId: mainGroupOwnerId,
        id: generateUUID(34, 'graph'),
        kind: 'pie',
        name: 'minimum',
    };

    const subjectWithAllFields: Graph = {
        dateRange: 'oneYear',
        group: {
            group: 'labels',
            hideOthers: false,
            labels: [1, 2].map(idx => listLabelIds[idx] as ApiUUID),
        },
        groupOwnerId: mainGroupOwnerId,
        horizontalGroup: {
            group: 'labels',
            hideOthers: true,
            labels: [3, 4].map(idx => listLabelIds[idx] as ApiUUID),
        },
        id: generateUUID(34, 'graph'),
        kind: 'line',
        name: 'max',
    };

    it('graphData with minimum transforms', () => {
        const graphUi = graphToUi(subjectDataMinimum);

        expect(graphUi.groupType).toEqual('month');

        expect(uiToGraph(graphUi)).toEqual(subjectDataMinimum);
    });

    it('graphData with all fields should match after transform', () => {
        const graphUi = graphToUi(subjectWithAllFields);
        expect(graphUi.horizontalGroupLabels).toEqual([3, 4].map(idx => listLabelIds[idx]));
        expect(uiToGraph(graphUi)).toEqual(subjectWithAllFields);
    });
});
