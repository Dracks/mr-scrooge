import { Table } from 'antd';
import * as React from 'react';

const TableView = ({data, header}) =>{
    const columns = Object.keys(header).map((e, k)=>{
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