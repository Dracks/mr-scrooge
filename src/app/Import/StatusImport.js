import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import StatusRowTableView from './StatusRowsTableView';

const StatusImportView = WithNotFound(({data})=>{
    return (
        <div>
            <h2 style={{textAlign:"center"}}>{data.kind}</h2>
            <StatusRowTableView status={data} />
        </div>
    )
}, 'data');

const StatusImport = ({match, status}) => {
    const id = parseInt(match.params.id, 10)
    const data = status.filter(e=>e.id===id)[0];
    
    return <StatusImportView data={data} />
}

const mapStateToProps = state => {
    return {
        status: state.importStatus.data
    }
}

export default connect(mapStateToProps)(StatusImport);