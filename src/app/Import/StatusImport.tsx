import { Row } from 'antd';
import { push } from 'connected-react-router'
import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import { MetaData } from 'redux-api-rest/lib/Types';
import { Danger } from 'src/components/dessign/buttons';
import { half } from 'src/components/dessign/grid';
import { Delete } from 'src/components/dessign/icons';
import { addDispatchWithProps } from 'src/utils/redux/AddDispatch';
import { FullDate } from '../../components/dessign/date';
import { Error, Warning } from '../../components/dessign/messages';
import { WithNotFound } from '../../components/NotFound';
import ImportActions from './Actions';
import StatusRowTableView from './StatusRowsTableView';

const LIMIT = moment().add(-7, 'days');
const StatusImportView = WithNotFound(({data, dispatch, remove, reload, goToRoot})=>{
    const removeFn = ()=>{
        remove(data, (meta:MetaData)=>{
            if (!meta.isLoading){
                reload()
                goToRoot();
            }
        })
    }
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
            <h2 style={{textAlign:"center"}}>{data.file_name}</h2>
            <Row type="flex" gutter={8}>
                {half(
                    <div>
                        <span>Kind:</span>{data.kind}<br />
                        <span>Date:</span><FullDate date={data.date}/>
                    </div>
                )}
                {half(
                    <div style={{textAlign:"right"}}>
                        <Danger disabled={data.date>LIMIT} onClick={removeFn}>
                            <Delete/>
                        </Danger>
                    </div>
                )}
            </Row>
            <Msg />
            {data.rows.length>0 && <StatusRowTableView status={data} dispatch={dispatch}/>}
        </div>
    )
}, 'data');

const StatusImport = ({match, status, ...others}) => {
    const id = parseInt(match.params.id, 10)
    const data = status.filter(e=>e.id===id)[0];
    
    return <StatusImportView {...{data, match}} {...others}/>
}

const mapStateToProps = state => {
    return {
        status: state.importStatus.data,
    }
}

const mapDispatchToProps = addDispatchWithProps(({location}: any)=>{
    const { pathname } = location;
    return ({
    dispatch: action => action,
    goToRoot: ()=>push(pathname.substr(0, pathname.lastIndexOf('/'))),
    reload: ImportActions.update,
    remove: ImportActions.remove,
})})

export default connect(mapStateToProps, mapDispatchToProps)(StatusImport);