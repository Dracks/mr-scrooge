import React from 'react';
import { Line } from "react-chartjs-2";

import Utils from './Utils';

let CompareByMonth = (props)=>{
    const start = new Date();
    const end = new Date();
    start.setMonth(start.getMonth()-3);
    var data = props.data.filter((e)=>{
        return e.date>start && e.date < end && e.value <0;
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
                <Line data={chartData} options={chartOptions} width="600" height="250"/>
            </div>
        </div>
    )
}

export default CompareByMonth;