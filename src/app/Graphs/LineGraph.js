import React from 'react';
import { Line } from "react-chartjs-2";

import Utils, {monthGroupLambda, dayGroupLambda, sumGroupsLambda} from './Utils';

let LineGraph = ({data, tag,  horizontal_group, line_group, join, acumulative=false, sort})=>{
    var data = data.filter((e)=>{
        return e.tags.indexOf(tag)!== -1;
    }).map(e=>{
        return {date: e.date, value: -e.value};
    });
    var chartOptions = {}
    var chartData = 
        Utils.toChartJs2Axis(
            Utils.joinGroups(
                Utils.getGrouppedForGraph(data, line_group, horizontal_group),
                join
            ),
            sort
        )
    chartData.datasets = Utils.applyColors(chartData.datasets);

    if (acumulative){
        Utils.acumChartJs2Axis(chartData);
    }

    return (
        <div>
            <div className="col s12">
                <Line data={chartData} options={chartOptions} width={600} height={250}/>
            </div>
        </div>
    )
}

export default LineGraph;