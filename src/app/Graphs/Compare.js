import React from 'react';

let CompareByMonth = (props)=>{
    

    return (
        <div>
            <LineChart data={chartData} options={chartOptions} width="600" height="250"/>
        </div>
    )
}

export default CompareByMonth;