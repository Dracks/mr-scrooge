import { GraphGroupEnum, GraphKind, GraphV2 } from '../../../api/client/graphs/types';
import { graphToUi, uiToGraph } from './graph.transformer';

describe('[graph.transformer]', () => {
    const subjectDataMinimum: GraphV2 = {
        dateRange: 'six',
        group: {
            group: GraphGroupEnum.month,
        },
        id: 34,
        kind: GraphKind.pie,
        name: 'minimum',
    };

    const subjectWithAllFields: GraphV2 = {
        dateRange: 'twelve',
        group: {
            group: GraphGroupEnum.tags,
            hideOthers: false,
            groupTags: [{ tag: 1 }, { tag: 2 }],
        },
        horizontalGroup: {
            group: GraphGroupEnum.tags,
            hideOthers: true,
            groupTags: [{ tag: 3 }, { tag: 4 }],
        },
        id: 34,
        kind: GraphKind.line,
        name: 'max',
    };

    it('graphData with minimum transforms', () => {
        const graphUi = graphToUi(subjectDataMinimum);

        expect(graphUi.groupKind).toEqual(GraphGroupEnum.month);

        expect(uiToGraph(graphUi)).toEqual(subjectDataMinimum);
    });

    it('graphData with all fields should match after transform', () => {
        const graphUi = graphToUi(subjectWithAllFields);
        expect(graphUi.horizontalGroupTags).toEqual([3, 4]);
        expect(uiToGraph(graphUi)).toEqual(subjectWithAllFields);
    });
});
