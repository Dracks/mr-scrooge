import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Layout } from 'antd';


import { logout } from './Session/Actions';
import { fetchRawData } from './RawData/Actions'
import { fetchTags } from './Tags/Actions'
import WithLoading from '../network/LoadingHoc';
import MultiPropsLoadingHOC from '../network/MultiPropsLoadingHOC';

import Loading from '../components/Loading';
import Header from '../components/Header';
import Contents from './Contents';
import Footer from '../components/Footer';

const isLoading = MultiPropsLoadingHOC([
    'allData',
    'tags'
])

const mapStateToPropsHead = ({session}) => {
    return {session}
}

const HeaderWithSession = withRouter(connect(mapStateToPropsHead, {logout})(Header))

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

const ContentsWithLoading = WithLoading(Contents, Loading, 'dataStatus', 'load');
const ContentsWithData = connect(mapStateToProps, mapActionsToProps)(ContentsWithLoading)

const ContentsWithRouter = withRouter(ContentsWithData)

const App = (props) => {
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