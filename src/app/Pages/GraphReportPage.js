import React from 'react';
import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc';

import Compare from '../Graphs/Compare';
import Loading from '../../components/Loading';
import { fetchRawData } from "../RawData/Actions";


const GraphReport = (props)=>{
    return (
        <Compare data={props.data} />
    )
}

const mapStateToProps = state=>{
    return {
        data:  state.allData
    }
}

const LoadingGraphReport = WithLoading(GraphReport, Loading, 'data', 'fetchRawData')
export default connect(mapStateToProps, {fetchRawData})(LoadingGraphReport)