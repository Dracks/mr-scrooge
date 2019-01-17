import React, {  ChangeEvent } from 'react';

interface IMyUploadProps {
    onAddFiles: (a:FileList) => void
}

class MyUpload extends React.Component<IMyUploadProps, {}>{
    private inputRef: string

    constructor(props){
        super(props)
        this.inputRef = "id"+Math.random()
        this.addFiles = this.addFiles.bind(this)
    }

    public addFiles(data: ChangeEvent<HTMLInputElement>){
        this.props.onAddFiles(data.currentTarget.files)
    }

    public render(){
        return (<span>
            <input id={this.inputRef} type="file" multiple={true} onChange={this.addFiles} style={{display:'none'}}/>
            <label htmlFor={this.inputRef} >
                {this.props.children}
            </label>
        </span>)
    }
}

export default MyUpload;