import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { MultiPropsLoadingHOC, withLoading } from 'redux-api-rest-hocs';

import { Layout } from 'antd';


import { fetchRawData } from './RawData/Actions'
import SessionActions from './Session/Actions';
import { fetchTags } from './Tags/Actions'

import Footer from '../components/Footer';
import Header from '../components/Header';
import Loading from '../components/Loading';
import Contents from './Contents';

const isLoading = MultiPropsLoadingHOC([
    'allData',
    'tags'
])

const mapStateToPropsHead = ({session}) => {
    return {session}
}

const HeaderWithSession = withRouter(connect(mapStateToPropsHead, {logout: SessionActions.logout})(Header) as any)

const mapStateToProps = state=>{
    return {
        dataStatus: isLoading(state)
    }
}

const mapActionsToProps = (dispatch) => {
    return {
        load: ()=>{
            dispatch(fetchRawData())
            dispatch(fetchTags())
        }
    }
}

const ContentswithLoading = withLoading(Contents, Loading, 'dataStatus', 'load');
const ContentsWithData = connect(mapStateToProps, mapActionsToProps)(ContentswithLoading)

const ContentsWithRouter = withRouter(ContentsWithData as any)

const App = (props: any) => {
    return (
        <Layout>
            <Layout.Header>
                <HeaderWithSession />
            </Layout.Header>
            <Layout.Content>
                <ContentsWithRouter />
            </Layout.Content>
            <Layout.Footer>
                <Footer />
            </Layout.Footer>
        </Layout>
    );
}


export default App