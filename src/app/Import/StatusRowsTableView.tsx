import * as React from 'react';

import { withLoading } from 'redux-api-rest-hocs'

import Loading from '../../components/Loading'
import TableView from '../../components/TableView'
import withFetch from './withFetch';

const LoadingTableView = withLoading(TableView, Loading, 'data', 'fetchData')
const StatusRowsTableView = ({status, dispatch}) =>{
    const request = status.rows.map((e)=>"ids[]="+e).join("&")
    const LoadingFetchTableView = withFetch(LoadingTableView, '/api/status-row/?'+request, 'data')
    return <LoadingFetchTableView header={{"movement_name": "movement name", "value":"import", "message":"Error"}} dispatch={dispatch} />
}



export default StatusRowsTableView;