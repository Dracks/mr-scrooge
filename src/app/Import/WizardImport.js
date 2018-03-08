import React from 'react';
import { connect } from 'react-redux';

import withLoading from '../../network/LoadingHoc';
import Select from '../../components/Select';
import Loading from '../../components/Loading';

import { fetchImportKinds } from "./Actions";

const WizardImport = ({acceptedKinds})=>{
    const listKinds = [{key:'', value:'Select'}].concat(acceptedKinds.map((e)=>{return {key:e, value:e}}))
    return (
        <div className="row">
            <Select options={listKinds} value=""/>
        </div>
        )
}
const mapStateToProps = ({acceptedKinds}) => {
    return { acceptedKinds }
}
const WizardImportLoading = withLoading(WizardImport, Loading, 'acceptedKinds', 'fetchImportKinds')
export default connect( mapStateToProps, { fetchImportKinds })(WizardImportLoading);