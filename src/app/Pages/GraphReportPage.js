import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';

import WithLoading, { extractData } from '../../network/LoadingHoc';
import ConstantsCSS from '../Constants-CSS';

import WrapGraph from '../Graphs/WrapGraph';
import Loading from '../../components/Loading';
import { getGraphConfig, serializerConfig } from '../Graphs/Configs';
import { saveGraphs, deleteGraph, fetchGraphs, addGraph } from '../Graphs/Actions';

const mapDispatchToProps = (dispatch)=>{
    return {
        save: (body)=>dispatch(saveGraphs(body)),
        destroy: (body)=>dispatch(deleteGraph(body)),
    }
}

const ConnectedGraph = connect(null, mapDispatchToProps)(WrapGraph);

const GraphReport = ({allData, hashTags, graphs, addGraph})=>{
    let graphConfig = getGraphConfig(hashTags);
    let packer = serializerConfig({hashTags});
    let columns = {
        xl: 24,
        sm: 24, 
        md: 12, 
        lg: 12, 
        xl: 12
    }
    return (
        <Row type="flex" gutter={8}>
            { graphs.map((element, index) => (
                <Col {...columns}>
                    <ConnectedGraph className="col s12 l6"
                        key={index}
                        data={allData} 
                        packer={packer} 
                        graphConfig={graphConfig} 
                        options={element} 
                        edit={!element.id}/>
                </Col>
            ))}
            <Col {...columns}>
            <div className="col s12 l6 center-align valign-wrapper">
                <button className={ConstantsCSS.Button.Floating} onClick={addGraph}>
                    <i className="material-icons">add</i>
                </button>
            </div>
            </Col>
        </Row>
    )
}

const mapStateToProps = state=>{
    return {
        graphs: state.graphs,
        allData:  extractData(state.allData),
        hashTags: state.hashTags
    }
}

const LoadingGraphReport = WithLoading(GraphReport, Loading, 'graphs', 'fetchGraphs')
export default connect(mapStateToProps, {fetchGraphs, addGraph})(LoadingGraphReport)