import * as React from 'react';
import { connect } from 'react-redux';
import { MultiPropsLoadingHOC, withLoading } from 'redux-api-rest-hocs';

import { Layout } from 'antd';


import { RawDataActions } from './RawData/Actions'
import SessionActions from './Session/Actions';
import { fetchTags } from './Tags/Actions'

import { IStoreType } from 'src/reducers';
import RouterSelectors from 'src/utils/router/selectors';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Loading from '../components/network/Loading';
import Contents from './Contents';
import ImportActions from './Import/Actions';

const isLoading = MultiPropsLoadingHOC([
    'allData',
    'tags',
    'importFileKinds'
])

const mapStateToPropsHead = ({session, ...state}: IStoreType) => {
    return {
        pathname: RouterSelectors.pathname(state),
        session: session.data,
    }
}

const HeaderWithSession = connect(mapStateToPropsHead, {logout: SessionActions.logout})(Header) as any

const mapStateToProps = state=>{
    return {
        dataStatus: isLoading(state)
    }
}

const mapActionsToProps = (dispatch) => {
    return {
        load: ()=>{
            dispatch(RawDataActions.fetch())
            dispatch(fetchTags())
            dispatch(ImportActions.getKinds())
        }
    }
}

const ContentswithLoading = withLoading(Contents, Loading, 'dataStatus', 'load');
const ContentsWithData = connect(mapStateToProps, mapActionsToProps)(ContentswithLoading)

const App = (props: any) => {
    return (
        <Layout>
            <Layout.Header>
                <HeaderWithSession />
            </Layout.Header>
            <Layout.Content>
                <ContentsWithData />
            </Layout.Content>
            <Layout.Footer>
                <Footer />
            </Layout.Footer>
        </Layout>
    );
}


export default App