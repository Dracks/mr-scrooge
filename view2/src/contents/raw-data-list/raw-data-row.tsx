import { TableRow, TableCell, TextArea } from 'grommet'
import React from 'react'
import { RawDataSource } from '../../api/client/raw-data-source/types'
import { RdsLinkTagAction, useRdsAddTag } from '../../api/client/raw-data-source/use-rds-add-tag'
import { useRdsSetDescription } from '../../api/client/raw-data-source/use-rds-set-description'
import { Tag } from '../../api/client/tag/types'
import { InputTag } from '../../utils/ui/tag/input-tag'
import { RdsEnriched } from '../common/raw-data-source.context'

interface RawDataRowProps {
    rds: RdsEnriched,
    tags: Tag[]
    onChange: (newData: RawDataSource)=>void
}

export
const RawDataRow: React.FC<RawDataRowProps> = ({rds, tags, onChange})=> {
    const linkTags = useRdsAddTag()
    const setComment = useRdsSetDescription()
    const tagsIds = rds.tags.map(tag => tag.id)
    const updateRdsTag = async (action: RdsLinkTagAction, tagId: number) => {
        
        onChange({
            ...rds, 
            tags: action === RdsLinkTagAction.Remove ? 
                tagsIds.filter(id=>id!=tagId) : 
                [...tagsIds, tagId]
        })
        const request = await linkTags(action, rds.id, tagId)
        onChange(request.data)
    }

    const updateDesc = async (desc: string) => {
        onChange({
            ...rds,
            tags: tagsIds,
            description: desc
        })
        const request = await setComment(rds.id, desc)
        onChange(request.data)
    }
    return <TableRow>
                <TableCell>{rds.kind}</TableCell>
                <TableCell><InputTag value={rds.tags} onAdd={tag => updateRdsTag(RdsLinkTagAction.Add, tag.id)} onRemove={tag => updateRdsTag(RdsLinkTagAction.Remove, tag.id)} suggestions={tags.filter(tag => !rds.tags.includes(tag))}/></TableCell>
                <TableCell>{rds.movementName}</TableCell>
                <TableCell>{rds.value}</TableCell>
                <TableCell>{rds.date}</TableCell>
                <TableCell>
                    <TextArea
                        value={rds.description ?? undefined}
                        onBlur={event => updateDesc(event.target.value)}
                    />
                </TableCell>
    </TableRow>

}