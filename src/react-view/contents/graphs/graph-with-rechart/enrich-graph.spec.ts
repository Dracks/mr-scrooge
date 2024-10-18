import { ApiUUID, Label } from '../../../api/models';
import { labelFactory, listLabelIds } from '../../../utils/data-factory/label.factory';
import { mainGroupOwnerId } from '../../../utils/data-factory/user-group.factory';
import { enrichGraph } from './enrich-graph';

describe('enrichGraph', () => {
    let labelsList: Label[];

    beforeEach(() => {
        labelsList = [
            labelFactory.build({ id: listLabelIds[1], name: 'tag1' }),
            labelFactory.build({ id: listLabelIds[2], name: 'tag2' }),
            labelFactory.build({ id: listLabelIds[3], name: 'tag3' }),
            labelFactory.build({ id: listLabelIds[4], name: 'tag4' }),
        ];
    });
    it('A graph with group type tags and preserving the order', () => {
        const result = enrichGraph(
            {
                dateRange: "all",
                group: {
                    labels: [3, 1].map(idx => listLabelIds[idx] as ApiUUID),
                    group: "labels",
                },
                groupOwnerId: mainGroupOwnerId,
                kind: "pie",
                name: 'some graph',
            },
            labelsList,
        );
        expect(result.group.labels).toEqual([labelsList[2], labelsList[0]]);
    });
});
