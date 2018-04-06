import React from 'react';
import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc';

import LineGraph from '../Graphs/LineGraph';
import Loading from '../../components/Loading';
import { fetchRawData } from "../RawData/Actions";
import { groupLambdas, reduceLambdas, sortLambdas } from '../Graphs/Lambdas';

const GraphReport = (props)=>{
    const start = new Date();
    const end = new Date();
    start.setMonth(start.getMonth()-3);
    start.setDate(1);
    let data = props.data.filter((e)=> e.date > start && e.date < end)
    return (
        <div className="row">
            <div className="col s12 center-align">
                {start.toDateString()} > {end.toDateString()}
            </div>
            <div className="col s6">
                <LineGraph 
                    data={data} 
                    tag={2}
                    horizontal_group={groupLambdas.day} 
                    line_group={groupLambdas.month} 
                    join={reduceLambdas.sum}
                    sort={sortLambdas.numbers}
                    acumulative={true} />
            </div>
            <div className="col s6">
                <LineGraph 
                    data={data} 
                    tag={1}
                    horizontal_group={groupLambdas.month} 
                    line_group={groupLambdas.sign} 
                    sort={sortLambdas.date}
                    join={reduceLambdas.absSum} />
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