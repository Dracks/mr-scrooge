import React from 'react'
import { Box, Table, TableBody } from 'grommet'
import { useGetDocumentsQuery } from '../../graphql/generated'
import { LoadingPage } from '../../utils/ui/loading'
import { FileRow } from './file-row'
import { ITagModel } from '../../utils/ui/tag/tag'

interface LastFilesProps {
    tags?: ITagModel[]
}

export const LastFiles: React.FC<LastFilesProps> = ({tags}) => {
    const [documentsQuery] = useGetDocumentsQuery({
        variables: {
            tags: tags?.map(tag => tag.id) || [],
        },
    })
    if (documentsQuery.fetching) {
        return <LoadingPage />
    } else if (documentsQuery.data) {
        return (
            <Box>
                <Table>
                    <TableBody>
                        {documentsQuery.data.getDocuments.map((doc) => (
                            <FileRow doc={doc} key={doc.id} />
                        ))}
                    </TableBody>
                </Table>
            </Box>
        )
    }
    return <div> Some Error</div>
}
