import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import { Menu } from 'antd';

import { withLoading } from 'redux-api-rest-hocs';
import Loading from '../../components/Loading';
import SiderPage from '../../components/SiderPage';
import { fetchStatus } from '../Import/Actions';
import { getPathElementName, shorterString } from '../Utils';


import { AddCircle, Err, Ok, Warning } from '../../components/dessign/icons';
import StatusImport from '../Import/StatusImport';
import WizardImport from '../Import/WizardImport';

const CLASS_NAME={
    'e': Err,
    'o': Ok,
    'w': Warning,
}
const shorter = shorterString(5, 10)

const ImportPage = ({match, status, location}) => {
    const basepath=match.url
    const statusListLinks=status.map((e)=>{
        const Ic = CLASS_NAME[e.status]
        return (<Menu.Item key={e.id}>
                    <Link to={basepath+'/'+e.id} className="collection-item">
                        <Ic />
                        {shorter(e.file_name)}
                    </Link>
                </Menu.Item>
        )
    })
    const l = getPathElementName(location, match);
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

const LoadingImportPage = withLoading(ImportPage, Loading, 'status', 'fetchStatus')
export default connect(mapStateToProps, {fetchStatus})(LoadingImportPage)