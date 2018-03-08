import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchRawData } from './RawData/Actions'
import { fetchTags } from './Tags/Actions'
import WithLoading from '../network/LoadingHoc';

import Loading from '../components/Loading';
import Header from '../components/Header';
import Contents from './Contents';
import Footer from '../components/Footer';

const PREFETCH_DATA = [
    'showData',
    'tags'
]

const App = (props) => {
    return (
        <div>
            <Header />
            <Contents />
            <Footer />
        </div>
    );
}

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

const ContentsWithLoading = WithLoading(App, Loading, 'dataStatus', 'load');
const AppWithData = connect(mapStateToProps, mapActionsToProps)(ContentsWithLoading)

export default withRouter(AppWithData)