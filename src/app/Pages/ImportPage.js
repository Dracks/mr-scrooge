import React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import { Menu } from 'antd';

import WithLoading from '../../network/LoadingHoc';
import { fetchStatus } from '../Import/Actions';
import Loading from '../../components/Loading';
import SiderPage from '../../components/SiderPage';
import { getPathElementName } from '../Utils';


import WizardImport from '../Import/WizardImport';
import StatusImport from '../Import/StatusImport';
import { Warning, Ok, Err, AddCircle } from '../../components/dessign/icons';

const CLASS_NAME={
    'o': Ok,
    'w': Warning,
    'e': Err
}

const ImportPage = ({match, status, location}) => {
    const basepath=match.url
    const statusListLinks=status.map((e, index)=>{
        const Ic = CLASS_NAME[e.status]
        return (<Menu.Item key={e.id}>
                    <Link to={basepath+'/'+e.id} className="collection-item">
                    <Ic />
                    {e.kind}
                    <i>{e.date}</i>
                    </Link>
                </Menu.Item>
        )
    })
    var l = getPathElementName(location, match);
    return (<SiderPage
                side={(
                    <Menu selectedKeys={[l]}>
                        <Menu.Item key='/wizard'>
                            <Link to={basepath+'/wizard'} className="collection-item"> 
                                <AddCircle />
                                Wizard new 
                            </Link>
                        </Menu.Item>
                        {statusListLinks}
                    </Menu>
                )}
                content={(
                    <Switch>
                        <Route
                            path={basepath + "/wizard"}
                            component={WizardImport}/>
                        <Route
                            path={basepath + "/:id"}
                            component={StatusImport}/>
                    </Switch>
                )} />
 
    )
}

const mapStateToProps = state => {
    return {
        status: state.importStatus
    }
}

const LoadingImportPage = WithLoading(ImportPage, Loading, 'status', 'fetchStatus')
export default connect(mapStateToProps, {fetchStatus})(LoadingImportPage)