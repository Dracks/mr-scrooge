import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import StatusRowTableView from './StatusRowsTableView';

const StatusImportView = WithNotFound(({data})=>{
    return (
        <div className="row">
            <div className="card blue-grey">
                <div className="card-content white-text">
                    <div className="card-title">{data.kind}</div>
                    <pre className="description">
                        {data.description}
                    </pre>
                </div>
            </div>
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