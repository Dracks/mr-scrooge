import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import ConstantsCss from '../Constants-CSS';
import withLoading from '../../network/LoadingHoc';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import InputFile from '../../components/InputFile';
import Message from '../../components/Message';

import { eventHandler } from '../Utils';

import { fetchImportKinds, updateStatus } from "./Actions";
import { updateRawData } from '../RawData/Actions';

const WizardImport = ({history, acceptedKinds, updateStatus, updateRawData})=>{
    const listKinds = [{key:'', value:'Select'}].concat(acceptedKinds.map((e)=>{return {key:e, value:e}}))
    var obj = {}
    const selectedFile = (e)=>{
        obj.kind = e;
    }
    const changeFile = (file) => {
        obj.data = file;
    }
    const sent = (e) => {
        var formData = new FormData();
        formData.append('kind', obj.kind);
        formData.append('file', obj.data, obj.data.name);
        fetch('/api/import/upload/', {
            method: 'POST',
            body: formData
        }).then(response=>{
            updateStatus();
            return response.json()
        }).then((data)=>{
            updateRawData();
            history.push('/import/'+data.id);
        })
    }
    return (
        <div className="row">
            <div className="col s4">
                <label>Select the kind of file to import</label>
                <Select options={listKinds} onChange={selectedFile}/>
            </div>
            <div className="col s6">
                <InputFile onChange={changeFile}/>
            </div>
            <div className="col s2">
                <button onClick={eventHandler(sent)} className="btn">Submit</button>
            </div>
        </div>
        )
}
const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}
const WizardImportLoading = withLoading(withRouter(WizardImport), Loading, 'acceptedKinds', 'fetchImportKinds')
export default connect( mapStateToProps, { fetchImportKinds, updateStatus, updateRawData })(WizardImportLoading);