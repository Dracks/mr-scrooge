import React from 'react';
import { connect } from 'react-redux';

import withLoading from '../../network/LoadingHoc';
import Select from '../../components/Select';
import Loading from '../../components/Loading';
import Input from '../../components/Input';
import InputFile from '../../components/InputFile';

import { eventHandler } from '../Utils';

import { fetchImportKinds } from "./Actions";

const WizardImport = ({acceptedKinds})=>{
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
            console.log(response);
        })
    }
    return (
        <div className="row">
            <Select options={listKinds} onChange={selectedFile}/>
            <InputFile onChange={changeFile}/>
            <button onClick={eventHandler(sent)} className="btn">Submit</button>
        </div>
        )
}
const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}
const WizardImportLoading = withLoading(WizardImport, Loading, 'acceptedKinds', 'fetchImportKinds')
export default connect( mapStateToProps, { fetchImportKinds })(WizardImportLoading);