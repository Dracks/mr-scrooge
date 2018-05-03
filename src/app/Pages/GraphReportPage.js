import React from 'react';
import { connect } from 'react-redux';

import WithLoading, { extractData } from '../../network/LoadingHoc';

import WrapGraph from '../Graphs/WrapGraph';
import Loading from '../../components/Loading';
//import { fetchRawData } from "../RawData/Actions";
import { getGraphConfig, serializerConfig } from '../Graphs/Configs';
import { saveGraphs } from '../Graphs/Actions';

const mapDispatchToProps = (dispatch)=>{
    return {
        save: (body)=>dispatch(saveGraphs(body))
    }
}

const ConnectedGraph = connect(null, mapDispatchToProps)(WrapGraph);

const GraphReport = ({allData, hashTags})=>{
    const start = new Date();
    const end = new Date();
    start.setMonth(start.getMonth()-3);
    start.setDate(1);
    let data = allData.filter((e)=> e.date > start && e.date < end);
    let tagsToGroup = [4,5,10,8];
    let graphConfig = getGraphConfig(hashTags);
    let packer = serializerConfig({hashTags});
    return (
        <div className="row">
            <div className="col s12 center-align">
                {start.toDateString()} > {end.toDateString()}
            </div>
            <ConnectedGraph className="col s12 l6" data={data} packer={packer} graphConfig={graphConfig} options={{
                tag: 2,
                horizontal:'day',
                group:  'month',
                kind: 'line',
                acumulative: true, 
            }}/>
            <ConnectedGraph className="col s12 l6" data={data} packer={packer} graphConfig={graphConfig} options={{
                tag:1,
                horizontal:'month',
                group: 'sign',
                kind: 'line', 
                acumulative: false
            }}/>
            <ConnectedGraph className="col s12 l6"
                    data={data} 
                    packer={packer} 
                    graphConfig={graphConfig} 
                    options={{
                        tag:2,
                        group: 'month',
                        horizontal: 'tags', 
                        horizontal_value: tagsToGroup,
                        kind: 'bar'
                    }} />
        </div>
    )
}

const mapStateToProps = state=>{
    return {
        allData:  extractData(state.allData),
        hashTags: state.hashTags
    }
}

//const LoadingGraphReport = WithLoading(GraphReport, Loading, 'allData', )
export default connect(mapStateToProps)(GraphReport)