import React from 'react';
import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc';

import BarGraph from '../Graphs/BarGraph';
import Graph from '../Graphs/Graph';
import Loading from '../../components/Loading';
import { fetchRawData } from "../RawData/Actions";
import { groupLambdas, reduceLambdas, sortLambdas } from '../Graphs/Lambdas';

const GraphReport = ({allData, hashTags})=>{
    const start = new Date();
    const end = new Date();
    start.setMonth(start.getMonth()-3);
    start.setDate(1);
    let data = allData.filter((e)=> e.date > start && e.date < end);
    let tagsToGroup = [4,5,10,8];
    return (
        <div className="row">
            <div className="col s12 center-align">
                {start.toDateString()} > {end.toDateString()}
            </div>
            <Graph className="col s12 l6" data={data} options={{
                tag: 2,
                horizontal: 'day',
                group: 'month',
                kind: 'line',
                acumulative: true, 
            }}/>
            <Graph className="col s12 l6" data={data} options={{
                tag:1,
                horizontal: 'month',
                group: 'sign',
                kind: 'line', 
                acumulative: false
            }}/>
            <div className="col s12 l6">
                <BarGraph 
                    data={data} 
                    tag={2}
                    line_group={groupLambdas.month} 
                    horizontal_group={groupLambdas.tags(tagsToGroup.map(e=>hashTags[e]))} 
                    sort={sortLambdas.tags(tagsToGroup.map(e=>hashTags[e].name))}
                    join={reduceLambdas.absSum} />
            </div>
        </div>
    )
}

const mapStateToProps = state=>{
    return {
        allData:  state.allData,
        hashTags: state.hashTags
    }
}

const LoadingGraphReport = WithLoading(GraphReport, Loading, 'allData', 'fetchRawData')
export default connect(mapStateToProps, {fetchRawData})(LoadingGraphReport)