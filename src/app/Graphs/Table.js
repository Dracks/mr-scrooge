import React from 'react';
import { Line } from "react-chartjs-2";

import Utils from './Utils';

const TableWithData = (props)=>{
    var data = props.data.filter((e)=>{
        return e.tags.indexOf(1)!== -1;
    }).map(e=>{
        return {date: e.date, value: e.value};
    });
    var chartOptions = {}
    var chartData = 
        Utils.toChartJs2Axis(
            Utils.sumGroups(Utils.getGrouppedByMonthAndSign(data)),
            (a,b) => {
                return a.localeCompare(b);
            }
        )
    chartData.datasets = Utils.applyColors(chartData.datasets);
    //Utils.acumChartJs2Axis(chartData);

    return (
        <div>
            <div className="col s12">
                <Line data={chartData} options={chartOptions} width={600} height={250}/>
            </div>
        </div>
    )
}

export default TableWithData