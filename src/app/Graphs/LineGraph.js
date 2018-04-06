import React from 'react';
import { Line } from "react-chartjs-2";

import DataManager from './DataManage';
import { colorizeLambdas } from './Lambdas';

let LineGraph = ({data, tag,  horizontal_group, line_group, join, acumulative=false, sort})=>{
    var helper = new DataManager(data.filter((e)=>{
        return e.tags.indexOf(tag)!== -1;
    }).map(e=>{
        return {date: e.date, value: e.value, tags: e.tags};
    }));

    var chartOptions = {}
    helper = helper.groupForGraph(line_group, horizontal_group)
        .reduceGroups(join)
        .toChartJs2Axis(sort)
        .applyColors(colorizeLambdas.line);

    if (acumulative){
        helper = helper.acumulate();
    }

    var chartData = helper.get()

    return (
        <div>
            <div className="col s12">
                <Line data={chartData} options={chartOptions} width={600} height={250}/>
            </div>
        </div>
    )
}

export default LineGraph;