import React from 'react';
import { connect } from 'react-redux';

import WithLoading from '../../network/LoadingHoc';

import Graph from '../Graphs/WrapGraph';
import { serializerConfig } from '../Graphs/Configs';
import Loading from '../../components/Loading';
import { fetchRawData } from "../RawData/Actions";
import { getGraphConfig } from '../Graphs/Configs';

const GraphReport = ({allData, hashTags, tags})=>{
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
            <Graph className="col s12 l6" data={data} packer={packer} graphConfig={graphConfig} options={{
                tag: 2,
                horizontal:'day',
                group:  'month',
                kind: 'line',
                acumulative: true, 
            }}/>
            <Graph className="col s12 l6" data={data} packer={packer} graphConfig={graphConfig} options={{
                tag:1,
                horizontal:'month',
                group: 'sign',
                kind: 'line', 
                acumulative: false
            }}/>
            <Graph className="col s12 l6"
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
        allData:  state.allData,
        hashTags: state.hashTags,
        tags: state.tags,
    }
}

const LoadingGraphReport = WithLoading(GraphReport, Loading, 'allData', 'fetchRawData')
export default connect(mapStateToProps, {fetchRawData})(LoadingGraphReport)