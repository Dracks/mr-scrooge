import * as React from 'react'; import { Component } from 'react';

import { eventHandler } from '../app/Utils';

class InputFile extends Component<any, any> {

    constructor(props){
        super(props);
        
        this.state = { name: '' }
    }

    onChange(e){
        var name='';
        var file = null;
        if (e.target.files.length > 0 ){
            file = e.target.files[0]
            name = file.name;
        }
        if (this.props.onChange){
            this.props.onChange(file);
        }
        this.setState({name: name})
    }

    render(){
        return (<div className="file-field input-field">
        <div className="btn">
          <span>File</span>
          <input type="file" onChange={eventHandler(this.onChange)}/>
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" value={this.state.name}/>
        </div>
      </div>)
    }
}

export default InputFile;