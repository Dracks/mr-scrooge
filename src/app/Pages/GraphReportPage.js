import React from 'react';
import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc';

import Compare from '../Graphs/Compare';
import Table from '../Graphs/Table';
import Loading from '../../components/Loading';
import { fetchRawData } from "../RawData/Actions";


const GraphReport = (props)=>{
    const start = new Date();
    const end = new Date();
    start.setMonth(start.getMonth()-3);
    start.setDate(1);
    let data = props.data.filter((e)=> e.date > start && e.date < end)
    return (
        <div className="row">
            <div className="col s6">
                <Compare data={data} />
            </div>
            <div className="col s6">
                <Table data={data} />
            </div>
        </div>
    )
}

const mapStateToProps = state=>{
    return {
        data:  state.allData
    }
}

const LoadingGraphReport = WithLoading(GraphReport, Loading, 'data', 'fetchRawData')
export default connect(mapStateToProps, {fetchRawData})(LoadingGraphReport)