import React, { Component } from 'react';
import { Line } from "react-chartjs-2";

import { groupLambdas, reduceLambdas, sortLambdas, colorizeLambdas } from './Lambdas';

import DataManager from './DataManage';

const GraphComponent={
    'line': Line,
}

class Graph extends Component {

    calculate(){
        const {
            tag,
            horizontal,
            group,
            acumulative,
            kind,
        } = this.props.options;
        var helper = new DataManager(this.props.data.filter((e)=>{
            return e.tags.indexOf(tag)!== -1;
        }).map(e=>{
            return {date: e.date, value: e.value, tags: e.tags};
        })).groupForGraph(groupLambdas[group], groupLambdas[horizontal])
            .reduceGroups(reduceLambdas.absSum)
            .toChartJs2Axis(sortLambdas[horizontal])
            .applyColors(colorizeLambdas[kind])
        if (acumulative){
            helper = helper.acumulate();
        }
        this.chartData = helper.get();
    }
    render(){
        this.calculate();
        const G = GraphComponent[this.props.options.kind];
        var options = <a className="btn-floating btn-medium waves-effect waves-light"><i className="material-icons">edit</i></a>
        return (
            <div className={this.props.className}>
                <G data={this.chartData} />
                {options}
            </div>
        );
    }
}

export default Graph;