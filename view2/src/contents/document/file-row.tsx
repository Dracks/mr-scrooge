import { TableCell, TableRow } from 'grommet'
import React from 'react'
import { InputTag } from '../../utils/ui/tag/input-tag'
import { ITagModel } from '../../utils/ui/tag/tag'
import { DocumentAlias } from './types'

export const FileRow: React.FC<{ doc: DocumentAlias }> = ({ doc }) => {
    const [currentTags, setCurrentTags] = React.useState<ITagModel[]>(doc.tags)
    return (
        <TableRow>
            <TableCell>{doc.name}</TableCell>
            <TableCell>
                <InputTag
                    value={doc.tags}
                    onAdd={(tag) =>
                        setCurrentTags([...currentTags, tag as ITagModel])
                    }
                    onRemove={(tag) => {
                        const position = currentTags.indexOf(tag)
                        if (position >= 0) {
                            currentTags.splice(position, 1)
                            setCurrentTags([...currentTags])
                        }
                    }}
                />
            </TableCell>
            <TableCell>{doc.owner.email}</TableCell>
            <TableCell>{doc.expiration}</TableCell>
        </TableRow>
    )
}
