import { Icon} from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';

import { restChain } from 'redux-api-rest-hocs';
import MyUpload from 'src/components/MyUpload';
import { Primary } from '../../components/dessign/buttons';
import Loading from '../../components/Loading';
import { IPairData } from '../../components/Select';
import ImportActions from "./Actions";

import { TextCenter } from 'src/components/dessign/style';
import addDispatch from 'src/utils/redux/AddDispatch';
import FileImportPreview from './Wizard/FileImportPreview';

enum FileStatus {
    draft='draft',
    ok='ok',
    loading='loading',
    error = 'error'

}

export interface IFileData {
    kind: string
    file: File
    status: FileStatus
}


interface IWizardImportProps {
    importFileKinds: Array<{
            key: string,
            regexp: RegExp
        }>
    sendFile: any
    history: any
}

interface IWizardImportState {
    fileList: IFileData[]
}

class WizardImportForm extends React.Component<IWizardImportProps, IWizardImportState> {
    private listKinds: IPairData[]

    constructor(props){
        super(props);
        this.state={fileList: []}
        this.addFiles = this.addFiles.bind(this)
        this.sendNext = this.sendNext.bind(this)
        const acceptedKinds = this.props.importFileKinds.map(({key})=>key)
        this.listKinds = [{key:'', value:'Select'}].concat(acceptedKinds.map((e)=>({key:e, value:e})))
    }

    public sendFile(index: number, element:IFileData){
        const {kind, file } = element
        const formData = new FormData();
        formData.append('kind', kind);
        formData.append('file', file, file.name);
        this.props.sendFile(formData, ()=>{
            this.changeElement(index, {...element, status:FileStatus.ok})
            setTimeout(this.sendNext, 100)
        });
    }

    public sendNext(){
        const fileList = this.state.fileList
        let found = false;
        let index = 0;
        while (!found && index < fileList.length){
            const element = fileList[index]
            if (element.status===FileStatus.draft){
                this.changeElement(index, {...element, status:FileStatus.loading})
                this.sendFile(index, element)
                found=true;
            }
            index++;
        }
    }

    public addFiles (fileList: FileList) {
        const fileRegexp = this.props.importFileKinds;
        const fileArray : File[] = [];
        // tslint:disable-next-line:prefer-for-of
        for (let aux=0; aux<fileList.length; aux++){
            fileArray.push(fileList[aux]);
        }
        const fileData : IFileData[] = fileArray.map((file)=>{
            const kindPair = fileRegexp.filter(e=>e.regexp.test(file.name))
            let kind = '';
            if (kindPair.length>0){
                kind = kindPair[0].key
            }
            return {
                file, 
                kind,
                status: FileStatus.draft
            }
        })
        this.setState({
            fileList: [...this.state.fileList, ...fileData],
        });
        return false;
    }

    public onRemoveFile(index: number){
        return ()=>{
            const fileList = this.state.fileList
            this.setState({fileList: [
                ...fileList.slice(0,index),
                ...fileList.slice(index+1)
            ]})
        }
    }

    public onChangeType(index: number){
        return (newType: string)=>{
            this.changeElement(index, {...this.state.fileList[index], kind:newType},)
        }
    }


    public render (){
        return (
            <div>
                <h2 style={TextCenter}>Import new data</h2>
                <div style={TextCenter}>
                    <MyUpload onAddFiles={this.addFiles}>
                        <Icon type="upload" /> Click to upload
                    </MyUpload>
                    <br />
                    {this.state.fileList.map((e, key)=><FileImportPreview 
                        acceptedKinds={this.listKinds}
                        key={key} 
                        data={e}
                        changeType={this.onChangeType(key)}
                        remove={this.onRemoveFile(key)}
                        />)}
                    <br />
                    <Primary onClick={this.sendNext}>
                        Send All
                    </Primary>
                </div>
            </div>
        )
    }

    private changeElement(index, element){
        const fileList = this.state.fileList
        this.setState({fileList: [
            ...fileList.slice(0, index),
            element,
            ...fileList.slice(index+1)
        ]})
    }
}

const mapStateToProps = ({importFileKinds}) => {
    return { 
        importFileKinds 
    }
}

const mapDispatchToProps = addDispatch({
    fetchImportKinds: ImportActions.getKinds,
    sendFile: ImportActions.sendFile
});

const WizardImportLoading = restChain()
    .setProperty('importFileKinds')
    .setInitialize('fetchImportKinds')
    .withLoading(Loading)
    .build(WizardImportForm) as any

export default connect( mapStateToProps, mapDispatchToProps)(WizardImportLoading);