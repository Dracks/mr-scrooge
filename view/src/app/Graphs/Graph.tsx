import * as React from 'react';

import { GraphComponentHash } from './Configs';
import { 
    colorCase, 
    colorizeLambdas, 
    colorSelector, 
    getRangeFilter, 
    groupLambdas, 
    reduceLambdas, 
    sortLambdas 
} from './Lambdas';

import DataManager from './DataManage';

/* tslint:disable object-literal-sort-keys */
const hashDateRange = {
    month: 1,
    three: 3,
    six: 6,
    year: 12,
    twoYears: 24,
}
/* tslint:enable */

const Graph = (props)=> {
    const {
        tag,
        date_range,
        horizontal,
        group,
        acumulative,
        kind,
    } = props.options;
    let data = props.data;

    if (hashDateRange[date_range]){
        data = data.filter(getRangeFilter(hashDateRange[date_range], new Date()));
    }

    if (tag){
        data = data.filter((e)=>{
            return e.tags.indexOf(tag)!== -1;
        })
    }
    let helper = new DataManager(data.map(e=>{
        return {date: e.date, value: e.value, tags: e.tags};
    })).groupForGraph(groupLambdas[group.name](group.value, group.others), groupLambdas[horizontal.name](horizontal.value, horizontal.others))
        .reduceGroups(reduceLambdas.absSum)
        .toChartJs2Axis(sortLambdas[horizontal.name](horizontal.value))
        .applyColors(colorizeLambdas[kind], colorCase[kind], {group: colorSelector[group.name], horizontal: colorSelector[horizontal.name]})
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