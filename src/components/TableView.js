import React from 'react';

const TableView = ({data, header}) =>{
    console.log(data);
    console.log(header);
    var order = []
    var headerHtml = []
    for (var key in header){
        var value = header[key]
        headerHtml.push(<th key={key}>{value}</th>)
        order.push(key)
    };
    var body = data.map((e, id)=>{
        return <tr key={id}>{order.map((k, id)=><td key={id}>{e[k]}</td>)}</tr>
    })

    return (
        <table className="striped">
            <thead>
                <tr>
                    {headerHtml}
                </tr>
            </thead>
            <tbody>
                {body}
            </tbody>
        </table>
    )
}

export default TableView