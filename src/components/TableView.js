import React from 'react';
import { Table } from 'antd';

//import ConstantsCss from '../app/Constants-CSS'

const TableView = ({data, header}) =>{
    let columns = Object.keys(header).map((e, k)=>{
        return {
            title: header[e],
            dataIndex: e,
            key: e
        }
    })

    return <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}/>
}

export default TableView