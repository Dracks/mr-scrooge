import React from 'react';

import { groupLambdas, reduceLambdas, sortLambdas, colorizeLambdas, getRangeFilter } from './Lambdas';
import { GraphComponentHash } from './Configs';

import DataManager from './DataManage';

const hashDateRange = {
    month: 1,
    three: 3,
    six: 6,
    year: 12
}

const Graph = (props)=> {
    const {
        tag,
        date_range,
        horizontal,
        group,
        acumulative,
        kind,
    } = props.options;
    let data = props.data.filter(getRangeFilter(hashDateRange[date_range], new Date()));
    if (tag !== undefined){
        data = data.filter((e)=>{
            return e.tags.indexOf(tag)!== -1;
        })
    }
    var helper = new DataManager(data.map(e=>{
        return {date: e.date, value: e.value, tags: e.tags};
    })).groupForGraph(groupLambdas[group.name](group.value), groupLambdas[horizontal.name](horizontal.value))
        .reduceGroups(reduceLambdas.absSum)
        .toChartJs2Axis(sortLambdas[horizontal.name](horizontal.value))
        .applyColors(colorizeLambdas[kind])
    if (acumulative){
        helper = helper.acumulate();
    }
    this.chartData = helper.get();

    const G = GraphComponentHash[props.options.kind].component;
    const options = GraphComponentHash[props.options.kind].options;
    return (
        <div className={props.className}>
            <G data={this.chartData} options={options} />
        </div>
    );
}

export default Graph;