import { GraphGroupEnum, GraphKind, GraphV2 } from '../../../api/client/graphs/types';
import { graphToUi, uiToGraph } from './graph.transformer';

describe('[graph.transformer]', () => {
    const subjectDataMinimum: GraphV2 = {
        id: 34,
        name: 'minimum',
        kind: GraphKind.pie,
        dateRange: 'six',
        group: {
            group: GraphGroupEnum.month,
        },
    };

    const subjectWithAllFields: GraphV2 = {
        id: 34,
        name: 'max',
        kind: GraphKind.line,
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
