import { Select } from "antd";
import React from 'react';

import { Danger } from "src/components/dessign/buttons";
import { Attachment, Delete, Err, Ok } from "src/components/dessign/icons";
import { Loading } from 'src/components/Loading';
import {  getOptions, IPairData } from "src/components/Select";
import { IFileData } from '../WizardImport';

interface IFileImportCell {
    acceptedKinds: IPairData[],
    data: IFileData
    remove: ()=>void
    changeType: (type:string)=>void
}

const StatusComponents = {
    error: <Err />,
    loading: <Loading />,
    ok: <Ok />,
}

const FileImportPreview = ({data, acceptedKinds, changeType, remove}:IFileImportCell)=>{
    return (<div>
            <Attachment/>
            <span>{data.file.name}</span>
            {data.status === 'draft' ? <span>
                <Select value={data.kind} onChange={changeType}>
                    {getOptions(acceptedKinds)}
                </Select>
                <Danger onClick={remove}>
                    <Delete/>
                </Danger>
            </span> : StatusComponents[data.status]}
        </div>)
}

export default FileImportPreview