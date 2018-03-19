import React from 'react';
import { connect } from 'react-redux';

import ConstantsCss from '../Constants-CSS';
import withLoading from '../../network/LoadingHoc';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import InputFile from '../../components/InputFile';
import Message from '../../components/Message';

import { eventHandler } from '../Utils';

import { fetchImportKinds, updateStatus } from "./Actions";

const WizardImport = ({acceptedKinds, updateStatus})=>{
    const listKinds = [{key:'', value:'Select'}].concat(acceptedKinds.map((e)=>{return {key:e, value:e}}))
    var showMessage;
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
            if (showMessage){
                showMessage(ConstantsCss.Message.Ok, "Saved correctly", JSON.stringify(response));
            }
            updateStatus();
        })
    }
    return (
        <div className="row">
            <div className="col s4">
                <Select options={listKinds} onChange={selectedFile}/>
            </div>
            <div className="col s6">
                <InputFile onChange={changeFile}/>
            </div>
            <div className="col s2">
                <button onClick={eventHandler(sent)} className="btn">Submit</button>
            </div>
            <div className="col s12">
                <Message register={(c)=>{showMessage=c}}/>
            </div>
        </div>
        )
}
const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}
const WizardImportLoading = withLoading(WizardImport, Loading, 'acceptedKinds', 'fetchImportKinds')
export default connect( mapStateToProps, { fetchImportKinds, updateStatus })(WizardImportLoading);