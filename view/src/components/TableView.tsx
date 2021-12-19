import { Table } from 'antd';
import * as React from 'react';

const TableView = ({data, header}) =>{
    const columns = Object.keys(header).map((e, k)=>{
        return {
            dataIndex: e,
            key: k,
            title: header[e],
        }
    })

    return <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        />
}

export default TableView