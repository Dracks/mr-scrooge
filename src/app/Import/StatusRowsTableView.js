import React from 'react';

import WithLoading from '../../network/LoadingHoc'

import Loading from '../../components/Loading'
import TableView from '../../components/TableView'
import WithFetch from '../../network/ConnectionHoc'

const LoadingTableView = WithLoading(TableView, Loading, 'data', 'fetchData')
const StatusRowsTableView = ({status}) =>{
    const request = status.rows.map((e)=>"ids[]="+e).join("&")
    const LoadingFetchTableView = WithFetch(LoadingTableView, '/api/status-row/?'+request, 'data')
    return <LoadingFetchTableView header={{"movement_name": "movement name", "value":"import", "message":"Error"}} />
}



export default StatusRowsTableView;