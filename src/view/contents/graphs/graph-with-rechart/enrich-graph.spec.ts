import { GQLGraphDateRange, GQLGraphGroup, GQLGraphKind, GQLLabel } from '../../../api/graphql/generated';
import { labelFactory } from '../../../utils/data-factory/label.factory';
import { enrichGraph } from './enrich-graph';

describe('enrichGraph', () => {
    let labelsList: GQLLabel[];

    beforeEach(() => {
        labelsList = [
            labelFactory.build({ id: 1, name: 'tag1' }),
            labelFactory.build({ id: 2, name: 'tag2' }),
            labelFactory.build({ id: 3, name: 'tag3' }),
            labelFactory.build({ id: 4, name: 'tag4' }),
        ];
    });
    it('A graph with group type tags and preserving the order', () => {
        const result = enrichGraph(
            {
                dateRange: GQLGraphDateRange.All,
                group: {
                    labels: [3, 1],
                    group: GQLGraphGroup.Labels,
                },
                groupOwnerId: 1,
                kind: GQLGraphKind.Pie,
                name: 'some graph',
            },
            labelsList,
        );
        expect(result.group.labels).toEqual([labelsList[2], labelsList[0]]);
    });
});
