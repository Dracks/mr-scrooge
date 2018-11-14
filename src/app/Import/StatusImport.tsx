import * as React from 'react';
import { connect } from 'react-redux';

import { Error, Warning } from '../../components/dessign/messages';
import { WithNotFound } from '../../components/NotFound';
import StatusRowTableView from './StatusRowsTableView';

const StatusImportView = WithNotFound(({data, dispatch})=>{
    let Msg = ()=><div/>
    if (data.description){
        switch(data.status){
            case "e":
                Msg = ()=>(<Error
                    title="Error"
                    message={data.description}
                />);
            break;
            case "w":
                Msg = ()=>(<Warning title="Warning" message={data.description}/>)
                break
            default:
                Msg = ()=><div />
        }
    }
    return (
        <div>
            <h2 style={{textAlign:"center"}}>{data.kind}</h2>
            <Msg />
            {data.rows.length>0 && <StatusRowTableView status={data} dispatch={dispatch}/>}
        </div>
    )
}, 'data');

const StatusImport = ({match, status, dispatch}) => {
    const id = parseInt(match.params.id, 10)
    const data = status.filter(e=>e.id===id)[0];
    
    return <StatusImportView data={data} dispatch={dispatch}/>
}

const mapStateToProps = state => {
    return {
        status: state.importStatus.data
    }
}

export default connect(mapStateToProps)(StatusImport);