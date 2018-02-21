import React from 'react';
import { Line } from "react-chartjs-2";

import Utils from './Utils';

let CompareByMonth = (props)=>{
    var chartOptions = {}
    var chartData = 
        Utils.toChartJs2Axis(
            Utils.sumGroups(Utils.getGrouppedByMonthAndDay(props.data))
        )
    chartData.datasets = Utils.applyColors(chartData.datasets);
    console.log(chartData);

    return (
        <div>
            <Line data={chartData} options={chartOptions} width="600" height="250"/>
        </div>
    )
}

export default CompareByMonth;