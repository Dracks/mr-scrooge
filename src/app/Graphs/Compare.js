import React from 'react';
import { Line } from "react-chartjs-2";

import Utils from './Utils';

let CompareByMonth = (props)=>{
    var data = props.data.filter((e)=>{
        return e.tags.indexOf(1)!== -1 && e.value <0;
    }).map(e=>{
        return {date: e.date, value: -e.value};
    });
    var chartOptions = {}
    var chartData = 
        Utils.toChartJs2Axis(
            Utils.sumGroups(Utils.getGrouppedByMonthAndDay(data))
        )
    chartData.datasets = Utils.applyColors(chartData.datasets);
    Utils.acumChartJs2Axis(chartData);
    console.log(chartData);

    return (
        <div>
            <div className="col s12">
                <Line data={chartData} options={chartOptions} width={600} height={250}/>
            </div>
        </div>
    )
}

export default CompareByMonth;