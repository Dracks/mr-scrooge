import { Box, Button, Heading } from 'grommet'
import {Attachment, DocumentUpload} from 'grommet-icons'
import React from 'react'
import { Kind } from '../../../api/client/imports/types';
import { useGetKinds } from '../../../api/client/imports/use-get-kind';
import { FileUploadQueue } from '../../../utils/ui/upload-queue';
import { FileStatus, IFileData } from '../types';
import { ImportFileRow } from './import-file-row';


const useUploadFileQueue = ( kind: Kind[])=>{
    const regexCompiled = React.useMemo(()=>kind.map(k=>({name: k.name, regex: new RegExp(k.regex)})),[kind])
    const [files, setFiles] = React.useState<Array<IFileData>>([])

    const onAdd = (newFiles : File[])=> {
        const newFilesCompiled = newFiles.map(file=>({
            file, 
            kind: regexCompiled.find(rx => rx.regex.test(file.name))?.name ?? 'Unknown', 
            status: FileStatus.load
        }))
        setFiles([...files, ...newFilesCompiled])
    }

    return {
        files, 
        onAdd,
    }
}

export const ImportWizard: React.FC = ()=> {
    const [kindResponse] = useGetKinds()
    const kindList = kindResponse.data ?? []
    const {files, onAdd} = useUploadFileQueue(kindList)
    return <Box fill align="center" justify="center">
        <Heading level='2'>
            Import Files
        </Heading>
        <FileUploadQueue label='Upload files' onAdd={onAdd}/>
        <Box >
            {files.map((data, idx)=>
                <ImportFileRow fileData={data} onRemove={()=>undefined} onKindSwitch={(kind)=>console.log(kind)} kindsList={kindList}/>
            )}
        </Box>
        <Button><DocumentUpload/></Button>
    </Box>
}
