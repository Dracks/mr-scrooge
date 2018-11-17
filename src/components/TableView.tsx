import { Table } from 'antd';
import * as React from 'react';

const TableView = ({data, header}) =>{
    const columns = Object.keys(header).map((e, k)=>{
        return {
            dataIndex: e,
            key: e,
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