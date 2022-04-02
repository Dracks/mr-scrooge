import { Box, Button, Heading } from 'grommet'
import {Attachment, DocumentUpload} from 'grommet-icons'
import React from 'react'
import { Kind } from '../../../api/client/imports/types';
import { useGetKinds } from '../../../api/client/imports/use-get-kind';
import { FileUploadQueue } from '../../../utils/ui/upload-queue';
import { FileStatus, IFileData } from '../types';
import { ImportFileRow } from './import-file-row';
import { useUploadQueue } from '../../common/uploader-queue'



const useKindWithRegex = ()=>{
    const [kindResponse] = useGetKinds()
    const kindList = kindResponse.data ?? []
    const regexCompiled = React.useMemo(()=>kindList.map(k=>({name: k.name, regex: new RegExp(k.regex)})),[kindList])
    return {
        kindList,
        findKind: (fileName: string) => regexCompiled.find(rx => rx.regex.test(fileName))?.name ?? 'Unknown'
    }
}

export const ImportWizard: React.FC = ()=> {
    const {files, onAdd, onChangeKind, submit, uploading} = useUploadQueue()
    const {kindList, findKind} = useKindWithRegex()
    console.log(files)

    return <Box fill align="center" justify="center">
        <Heading level='2'>
            Import Files
        </Heading>
        {!uploading && <FileUploadQueue label='Upload files' onAdd={(files) => onAdd(files.map(file => ({file, kind: findKind(file.name)})))}/>}
        <Box >
            {files.map((data, idx)=>
                <ImportFileRow 
                    key={idx}
                    fileData={data} 
                    onRemove={()=>undefined} 
                    onKindSwitch={(kind)=>onChangeKind(data.id, kind)} 
                    kindsList={kindList}/>
            )}
        </Box>
        <Button disabled={uploading} onClick={submit}><DocumentUpload/></Button>
    </Box>
}
