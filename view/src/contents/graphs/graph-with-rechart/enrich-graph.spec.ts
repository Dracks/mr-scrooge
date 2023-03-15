import { Tag } from '../../../api/client/tag/types';
import { tagFactory } from '../../../utils/data-factory/tag.factory';
import {enrichGraph} from './enrich-graph'


describe('enrichGraph', ()=>{
    let tagsMap : Map<number, Tag>
    const tagId=(tag: number)=>({tag})

    beforeEach(()=>{
        const tagsList = [
            tagFactory.build({id: 1, name: 'tag1'}),
            tagFactory.build({id: 2, name: 'tag2'}),
            tagFactory.build({id: 3, name: 'tag3'}),
            tagFactory.build({id: 4, name: 'tag4'})
        ]
        tagsMap = new Map(tagsList.map(tag => [tag.id, tag]))
    })
    it('A graph with group type tags and preserving the order', ()=>{
        const result = enrichGraph({
            dateRange: 'all',
            group: {
                groupTags: [tagId(3), tagId(1)],
                group: 'tags',
            },
            id: 1,
            kind: 'pie',
            name: 'some graph'
        }, tagsMap)
        expect(result.group.groupTags).toEqual([tagsMap.get(3), tagsMap.get(1)])
    })
})
