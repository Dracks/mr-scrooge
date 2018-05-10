import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logout } from './Session/Actions';
import { fetchRawData } from './RawData/Actions'
import { fetchTags } from './Tags/Actions'
import WithLoading from '../network/LoadingHoc';

import Loading from '../components/Loading';
import Header from '../components/Header';
import Contents from './Contents';
import Footer from '../components/Footer';

const PREFETCH_DATA = [
    'allData',
    'tags'
]

const mapStateToPropsHead = ({session}) => {
    return {session}
}

const HeaderWithSession = connect(mapStateToPropsHead, {logout})(Header)

const mapStateToProps = state=>{
    var status = null
    var totalKeys = PREFETCH_DATA.length;
    var count = PREFETCH_DATA.filter((e)=>{
        return state[e] && state[e].isLoading === false
    });
    if (count.length === totalKeys){
        status = {isLoading: false, data: {}};
    } else {
        count = PREFETCH_DATA.filter((e)=>{
            return state[e] && state[e].isLoading === true
        })
        if (count.length >0 ){
            status = {isLoading: true};
        }
    }
    return {
        dataStatus: status
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
        <div>
            <HeaderWithSession />
            <ContentsWithRouter />
            <Footer />
        </div>
    );
}


export default App