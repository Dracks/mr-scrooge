import React from 'react';

import { groupLambdas, reduceLambdas, sortLambdas, colorizeLambdas } from './Lambdas';
import { GraphComponent } from './Configs';

import DataManager from './DataManage';

const Graph = (props)=> {
    const {
        tag,
        horizontal,
        group,
        acumulative,
        kind,
    } = props.options;
    var helper = new DataManager(props.data.filter((e)=>{
        return e.tags.indexOf(tag)!== -1;
    }).map(e=>{
        return {date: e.date, value: e.value, tags: e.tags};
    })).groupForGraph(groupLambdas[group.name](group.value), groupLambdas[horizontal.name](horizontal.value))
        .reduceGroups(reduceLambdas.absSum)
        .toChartJs2Axis(sortLambdas[horizontal.name](horizontal.value))
        .applyColors(colorizeLambdas[kind])
    if (acumulative){
        helper = helper.acumulate();
    }
    this.chartData = helper.get();

    const G = GraphComponent[props.options.kind].component;
    return (
        <div className={props.className}>
            <G data={this.chartData} />
        </div>
    );
}

export default Graph;