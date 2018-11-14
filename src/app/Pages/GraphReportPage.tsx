import { Card,  Row } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';

import { restChain } from 'redux-api-rest-hocs';
import { Primary } from '../../components/dessign/buttons';
import { half } from '../../components/dessign/grid';
import { Add } from '../../components/dessign/icons';

import Loading from '../../components/Loading';
import { addGraph, deleteGraph, fetchGraphs, saveGraphs } from '../Graphs/Actions';
import { getGraphConfig, serializerConfig } from '../Graphs/Configs';
import WrapGraph from '../Graphs/WrapGraph';

const mapDispatchToProps = (dispatch)=>{
    return {
        destroy: (body)=>dispatch(deleteGraph(body)),
        save: (body)=>dispatch(saveGraphs(body)),
    }
}

const ConnectedGraph = connect(null, mapDispatchToProps)(WrapGraph);

const GraphReport = ({allData, hashTags, graphs, addGraphFn})=>{
    const graphConfig = getGraphConfig(hashTags);
    const packer = serializerConfig({hashTags});
    return (
        <Row type="flex" gutter={8}>
            { graphs.map((element, index) => (
                half(
                    <Card title={element.name}>
                        <ConnectedGraph
                            key={index}
                            data={allData}
                            packer={packer}
                            graphConfig={graphConfig}
                            options={element}
                            edit={!element.id}/>
                    </Card>,
                    {key:index}
                )
            ))}
            {half(
                <Card >
                    <Primary shape="circle" onClick={addGraphFn}>
                        <Add />
                    </Primary>
                </Card>
            )}
        </Row>
    )
}

const mapStateToProps = ({graphs, allData, hashTags})=>{
    return {
        allData,
        graphs,
        hashTags
    }
}

const LoadingGraphReport = restChain()
    .setInitialize('fetchGraphs')
    .setProperty('graphs')
    .withLoading(Loading)
    .build(GraphReport)

export default connect(mapStateToProps, {fetchGraphs, addGraphFn: addGraph})(restChain().setProperty('allData').build(LoadingGraphReport) as any)