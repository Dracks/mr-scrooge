import React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import WithLoading from '../../network/LoadingHoc';
import { fetchStatus } from '../Import/Actions';
import Loading from '../../components/Loading';

import WizardImport from '../Import/WizardImport';
import StatusImport from '../Import/StatusImport';

const CLASS_NAME={
    'o': "btn btn-floating green",
    'w': "btn btn-floating yellow",
    'e': "btn btn-floating red"
}

const ImportPage = (props)=>{
    const basepath=props.match.url
    const statusListLinks=props.status.map((e, index)=>{
        return <Link key={index} to={basepath+'/'+e.id} className="collection-item"><span className={CLASS_NAME[e.status]}>&nbsp;</span>{e.kind}<br/>{e.date}</Link>;
    })
    return (<div className="row">
        <div className="col s3">
            <div className="collection">
                <Link to={basepath+'/wizard'} className="collection-item"> 
                    <i className="material-icons">add</i> 
                    Wizard new 
                </Link>
                {statusListLinks}
            </div>
        </div>
        <div className="col s9">
            <Switch>
                <Route
                    path={basepath + "/wizard"}
                    component={WizardImport}/>
                <Route
                    path={basepath + "/:id"}
                    component={StatusImport}/>
            </Switch>
        </div>

    </div>)
}

const mapStateToProps = state => {
    return {
        status: state.importStatus
    }
}

const LoadingImportPage = WithLoading(ImportPage, Loading, 'status', 'fetchStatus')
export default connect(mapStateToProps, {fetchStatus})(LoadingImportPage)